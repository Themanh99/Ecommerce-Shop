import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpType, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  APP_TIMEOUTS,
  ERROR_MESSAGES,
} from '../common/constants/app.constants';
import { addDays, addMinutes } from '../common/utils/date.util';
import { randomOtp, validateEmail } from '../common/utils/string.util';
import { REDIS_CLIENT } from '../redis/redis.module';
import {
  CheckIdentityDto,
  LoginDto,
  LoginOtpDto,
  OtpRequestType,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mail: MailService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  private async createAndSendOtp(
    contact: string,
    type: OtpType,
    userId?: string,
  ) {
    const code = randomOtp(6);
    const expiresAt = addMinutes(new Date(), APP_TIMEOUTS.OTP_MINUTES);

    await this.prisma.otpCode.updateMany({
      where: { contact, type, used: false },
      data: { used: true },
    });

    await this.prisma.otpCode.create({
      data: { code, contact, type, expiresAt, userId },
    });

    if (validateEmail(contact)) {
      const mailType =
        type === OtpType.REGISTER
          ? 'register'
          : type === OtpType.RESET_PASSWORD
            ? 'reset'
            : 'login';
      await this.mail.sendOtp(contact, code, mailType);
    }

    return code;
  }

  private async verifyOtp(
    contact: string,
    code: string,
    type: OtpType,
  ): Promise<boolean> {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        contact,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return false;
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });
    return true;
  }

  private async generateTokens(
    user: Pick<User, 'id' | 'role' | 'name' | 'email' | 'phone'>,
  ) {
    const payload = { sub: user.id, role: user.role, name: user.name };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    const expiresAt = addDays(new Date(), APP_TIMEOUTS.JWT_REFRESH_DAYS);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(oldRefreshToken: string) {
    const blacklisted = await this.redis.get(`blacklist:${oldRefreshToken}`);
    if (blacklisted) {
      throw new UnauthorizedException('Token da bi thu hoi');
    }

    try {
      await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token khong hop le hoac da het han',
      );
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token khong ton tai');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.redis.set(
      `blacklist:${oldRefreshToken}`,
      '1',
      'EX',
      APP_TIMEOUTS.TOKEN_BLACKLIST_SECONDS,
    );

    return this.generateTokens(stored.user);
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.redis.set(
      `blacklist:${refreshToken}`,
      '1',
      'EX',
      APP_TIMEOUTS.TOKEN_BLACKLIST_SECONDS,
    );
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async checkIdentity(dto: CheckIdentityDto) {
    const { contact } = dto;
    const isEmail = validateEmail(contact);

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });

    return { exists: !!user, role: user?.role ?? null };
  }

  async sendOtp(dto: SendOtpDto) {
    const typeMap: Record<OtpRequestType, OtpType> = {
      register: OtpType.REGISTER,
      login: OtpType.LOGIN,
      reset: OtpType.RESET_PASSWORD,
    };

    const user = await this.prisma.user.findFirst({
      where: validateEmail(dto.contact)
        ? { email: dto.contact }
        : { phone: dto.contact },
    });

    await this.createAndSendOtp(dto.contact, typeMap[dto.type], user?.id);
    return { message: 'Ma OTP da duoc gui' };
  }

  async register(dto: RegisterDto) {
    const { contact, name, otp, password } = dto;
    const isEmail = validateEmail(contact);

    const existing = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });

    if (existing) {
      throw new ConflictException('Tai khoan da ton tai');
    }

    const valid = await this.verifyOtp(contact, otp, OtpType.REGISTER);
    if (!valid) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP);
    }

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
    const isEmail = validateEmail(contact);

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });

    if (!user) {
      throw new NotFoundException('Tai khoan khong ton tai');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tai khoan da bi khoa');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Tai khoan nay dung OTP hoac Google de dang nhap',
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Mat khau khong chinh xac');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async loginWithOtp(dto: LoginOtpDto) {
    const { contact, otp } = dto;
    const isEmail = validateEmail(contact);

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });

    if (!user) {
      throw new NotFoundException('Tai khoan khong ton tai');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tai khoan da bi khoa');
    }

    const valid = await this.verifyOtp(contact, otp, OtpType.LOGIN);
    if (!valid) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP);
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { contact, otp, newPassword } = dto;
    const isEmail = validateEmail(contact);

    const valid = await this.verifyOtp(contact, otp, OtpType.RESET_PASSWORD);
    if (!valid) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP);
    }

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: contact } : { phone: contact },
    });

    if (!user) {
      throw new NotFoundException('Tai khoan khong ton tai');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: user.id },
    });
    for (const token of tokens) {
      await this.redis.set(
        `blacklist:${token.token}`,
        '1',
        'EX',
        APP_TIMEOUTS.TOKEN_BLACKLIST_SECONDS,
      );
    }

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return { message: 'Dat lai mat khau thanh cong' };
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      const byEmail = await this.prisma.user.findFirst({
        where: { email: googleUser.email },
      });
      if (byEmail) {
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            googleId: googleUser.googleId,
            avatar: googleUser.avatar,
            isEmailVerified: true,
          },
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

    if (!user.isActive) {
      throw new ForbiddenException('Tai khoan da bi khoa');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Nguoi dung khong ton tai');
    }

    return this.sanitize(user);
  }

  private sanitize(user: User) {
    const { password, googleId, ...safe } = user;
    return safe;
  }
}
