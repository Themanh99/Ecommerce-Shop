import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  CheckIdentityDto,
  LoginDto,
  LoginOtpDto,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = this.config.get('NODE_ENV') === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh', // Only sent to refresh endpoint
    });
  }

  @Post('check-identity')
  @HttpCode(HttpStatus.OK)
  checkIdentity(@Body() dto: CheckIdentityDto) {
    return this.auth.checkIdentity(dto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.register(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('login-otp')
  @HttpCode(HttpStatus.OK)
  async loginOtp(@Body() dto: LoginOtpDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.auth.loginWithOtp(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (!oldRefreshToken) throw new UnauthorizedException('Không tìm thấy refresh token');
    const { accessToken, refreshToken } = await this.auth.refreshTokens(oldRefreshToken);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { message: 'Token đã được làm mới' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) await this.auth.revokeRefreshToken(refreshToken);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return { message: 'Đăng xuất thành công' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('sub') userId: string) {
    return this.auth.getMe(userId);
  }

  // ─── GOOGLE OAUTH ─────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Redirects to Google Auth page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = (req as any).user;
    const { user, accessToken, refreshToken } = await this.auth.googleLogin(googleUser);
    this.setTokenCookies(res, accessToken, refreshToken);
    // Redirect to frontend with user data in query (or just redirect to home)
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    res.redirect(`${frontendUrl}/auth/callback?role=${user.role}`);
  }
}
