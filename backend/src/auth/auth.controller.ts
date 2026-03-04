import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  COOKIE_KEYS,
  ERROR_MESSAGES,
  getCookieConfig,
} from '../common/constants/app.constants';
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

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const cookieConfig = getCookieConfig(isProd);

    res.cookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, cookieConfig.accessToken);
    res.cookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, cookieConfig.refreshToken);
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
    const oldRefreshToken = req.cookies?.[COOKIE_KEYS.REFRESH_TOKEN];

    if (!oldRefreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.MISSING_REFRESH_TOKEN);
    }

    const { accessToken, refreshToken } = await this.auth.refreshTokens(oldRefreshToken);
    this.setTokenCookies(res, accessToken, refreshToken);

    return { message: 'Token da duoc lam moi' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[COOKIE_KEYS.REFRESH_TOKEN];
    if (refreshToken) {
      await this.auth.revokeRefreshToken(refreshToken);
    }

    const isProd = this.config.get('NODE_ENV') === 'production';
    const cookieConfig = getCookieConfig(isProd);
    res.clearCookie(COOKIE_KEYS.ACCESS_TOKEN, cookieConfig.clearAccessToken);
    res.clearCookie(COOKIE_KEYS.REFRESH_TOKEN, cookieConfig.clearRefreshToken);

    return { message: 'Dang xuat thanh cong' };
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = (req as Request & { user: any }).user;
    const { user, accessToken, refreshToken } = await this.auth.googleLogin(googleUser);
    this.setTokenCookies(res, accessToken, refreshToken);

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    res.redirect(`${frontendUrl}/auth/callback?role=${user.role}`);
  }
}
