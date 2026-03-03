import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { OtpType, Role, User } from '@prisma/client';
import {
  CheckIdentityDto,
  LoginDto,
  LoginOtpDto,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
} from './dto/auth.dto';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mail: MailService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  // ─── OTP UTILS ────────────────────────────────────
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isEmail(contact: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  }

  private async createAndSendOtp(contact: string, type: OtpType, userId?: string) {
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate old OTPs for this contact/type
    await this.prisma.otpCode.updateMany({
      where: { contact, type, used: false },
      data: { used: true },
    });

    await this.prisma.otpCode.create({
      data: { code, contact, type, expiresAt, userId },
    });

    if (this.isEmail(contact)) {
      const mailType = type === OtpType.REGISTER ? 'register' : type === OtpType.RESET_PASSWORD ? 'reset' : 'login';
      await this.mail.sendOtp(contact, code, mailType);
    }
    // SMS: integrate later if needed
    return code;
  }

  private async verifyOtp(contact: string, code: string, type: OtpType): Promise<boolean> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { contact, code, type, used: false, expiresAt: { gt: new Date() } },
    });
    if (!otp) return false;
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
    return true;
  }

  // ─── TOKEN UTILS ──────────────────────────────────
  private async generateTokens(user: Pick<User, 'id' | 'role' | 'name' | 'email' | 'phone'>) {
    const payload = { sub: user.id, role: user.role, name: user.name };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    return { accessToken, refreshToken };
  }

  async refreshTokens(oldRefreshToken: string) {
    // Check blacklist in Redis
    const blacklisted = await this.redis.get(`blacklist:${oldRefreshToken}`);
    if (blacklisted) throw new UnauthorizedException('Token đã bị thu hồi');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored) throw new UnauthorizedException('Refresh token không tồn tại');

    // Rotate: invalidate old, issuer new
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.redis.set(`blacklist:${oldRefreshToken}`, '1', 'EX', 7 * 24 * 3600);

    return this.generateTokens(stored.user);
  }

  async revokeRefreshToken(refreshToken: string) {
    const ttl = 7 * 24 * 3600; // 7 days in seconds
    await this.redis.set(`blacklist:${refreshToken}`, '1', 'EX', ttl);
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  // ─── AUTH FLOWS ───────────────────────────────────
  async checkIdentity(dto: CheckIdentityDto) {
    const { contact } = dto;
    const isEmail = this.isEmail(contact);
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });
    return { exists: !!user, role: user?.role ?? null };
  }

  async sendOtp(dto: SendOtpDto) {
    const typeMap: Record<string, OtpType> = {
      register: OtpType.REGISTER,
      login: OtpType.LOGIN,
      reset: OtpType.RESET_PASSWORD,
    };
    const user = await this.prisma.user.findFirst({
      where: this.isEmail(dto.contact) ? { email: dto.contact } : { phone: dto.contact },
    });
    await this.createAndSendOtp(dto.contact, typeMap[dto.type], user?.id);
    return { message: 'Mã OTP đã được gửi' };
  }

  async register(dto: RegisterDto) {
    const { contact, name, otp, password } = dto;
    const isEmail = this.isEmail(contact);

    // Check if user already exists
    const existing = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });
    if (existing) throw new ConflictException('Tài khoản đã tồn tại');

    // Verify OTP
    const valid = await this.verifyOtp(contact, otp, OtpType.REGISTER);
    if (!valid) throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        name,
        email: isEmail ? contact : null,
        phone: !isEmail ? contact : null,
        password: hashedPassword,
        isEmailVerified: isEmail,
        isPhoneVerified: !isEmail,
      },
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const { contact, password } = dto;
    const isEmail = this.isEmail(contact);
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa');
    if (!user.password) throw new BadRequestException('Tài khoản này dùng OTP hoặc Google để đăng nhập');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Mật khẩu không chính xác');

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async loginWithOtp(dto: LoginOtpDto) {
    const { contact, otp } = dto;
    const isEmail = this.isEmail(contact);
    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa');

    const valid = await this.verifyOtp(contact, otp, OtpType.LOGIN);
    if (!valid) throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { contact, otp, newPassword } = dto;
    const isEmail = this.isEmail(contact);

    const valid = await this.verifyOtp(contact, otp, OtpType.RESET_PASSWORD);
    if (!valid) throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    // Revoke all refresh tokens for this user (force re-login)
    const tokens = await this.prisma.refreshToken.findMany({ where: { userId: user.id } });
    for (const t of tokens) {
      await this.redis.set(`blacklist:${t.token}`, '1', 'EX', 7 * 24 * 3600);
    }
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async googleLogin(googleUser: { googleId: string; email: string; name: string; avatar: string }) {
    let user = await this.prisma.user.findFirst({ where: { googleId: googleUser.googleId } });
    if (!user) {
      // Also try find by email in case manually registered before
      const byEmail = await this.prisma.user.findFirst({ where: { email: googleUser.email } });
      if (byEmail) {
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: googleUser.googleId, avatar: googleUser.avatar, isEmailVerified: true },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            googleId: googleUser.googleId,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.avatar,
            isEmailVerified: true,
          },
        });
      }
    }
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khóa');
    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.sanitize(user);
  }

  private sanitize(user: User) {
    const { password, googleId, ...safe } = user;
    return safe;
  }
}
