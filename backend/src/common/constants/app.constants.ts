import { CookieOptions } from 'express';

export const APP_TIMEOUTS = {
  OTP_MINUTES: 5,
  JWT_ACCESS_MINUTES: 15,
  JWT_REFRESH_DAYS: 7,
  TOKEN_BLACKLIST_SECONDS: 7 * 24 * 60 * 60,
} as const;

export const REGEX_PATTERNS = {
  VN_PHONE: /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_OR_PHONE: /(^[^\s@]+@[^\s@]+\.[^\s@]+$)|(^((0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7})$)/,
  PASSWORD_STRONG: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

export const API_LIMITS = {
  THROTTLE_TTL_MS: 60_000,
  THROTTLE_LIMIT: 30,
  DEFAULT_PAGE_LIMIT: 20,
  MAX_PAGE_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const COOKIE_PATHS = {
  REFRESH: '/api/auth/refresh',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email khong hop le',
  INVALID_PHONE: 'So dien thoai Viet Nam khong hop le',
  INVALID_CONTACT: 'Thong tin lien he phai la email hoac so dien thoai',
  INVALID_OTP: 'Ma OTP khong dung hoac da het han',
  MISSING_REFRESH_TOKEN: 'Khong tim thay refresh token',
  UNAUTHORIZED: 'Khong duoc phep truy cap',
  INTERNAL_SERVER_ERROR: 'Loi he thong',
} as const;

type CookieGroup = {
  accessToken: CookieOptions;
  refreshToken: CookieOptions;
  clearAccessToken: CookieOptions;
  clearRefreshToken: CookieOptions;
};

export const getCookieConfig = (isProduction: boolean): CookieGroup => {
  const commonOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  };

  return {
    accessToken: {
      ...commonOptions,
      maxAge: APP_TIMEOUTS.JWT_ACCESS_MINUTES * 60 * 1000,
    },
    refreshToken: {
      ...commonOptions,
      maxAge: APP_TIMEOUTS.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000,
      path: COOKIE_PATHS.REFRESH,
    },
    clearAccessToken: {
      ...commonOptions,
      maxAge: 0,
    },
    clearRefreshToken: {
      ...commonOptions,
      maxAge: 0,
      path: COOKIE_PATHS.REFRESH,
    },
  };
};
