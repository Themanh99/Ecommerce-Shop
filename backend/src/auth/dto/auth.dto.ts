import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsEnum,
} from 'class-validator';

const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[0|6-9]|8[0-9]|9[0-9])[0-9]{7}$/;

export class CheckIdentityDto {
  @IsNotEmpty({ message: 'SĐT hoặc Email không được để trống' })
  @IsString()
  contact: string; // phone hoặc email
}

export class RegisterDto {
  @IsNotEmpty({ message: 'SĐT hoặc Email không được để trống' })
  @IsString()
  contact: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString()
  otp: string;

  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'SĐT hoặc Email không được để trống' })
  @IsString()
  contact: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  password: string;
}

export class LoginOtpDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsEnum(['register', 'login', 'reset'])
  type: 'register' | 'login' | 'reset';
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  newPassword: string;
}
