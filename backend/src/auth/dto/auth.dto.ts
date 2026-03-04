import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ValidateContact } from '../../common/decorators/validate-contact.decorator';

export enum OtpRequestType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET = 'reset',
}

export class CheckIdentityDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;

  @IsNotEmpty({ message: 'Ho ten khong duoc de trong' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Ma OTP khong duoc de trong' })
  @IsString()
  otp: string;

  @IsOptional()
  @MinLength(6, { message: 'Mat khau toi thieu 6 ky tu' })
  password?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;

  @IsNotEmpty({ message: 'Mat khau khong duoc de trong' })
  @IsString()
  password: string;
}

export class LoginOtpDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;

  @IsNotEmpty({ message: 'Ma OTP khong duoc de trong' })
  @IsString()
  otp: string;
}

export class SendOtpDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;

  @IsEnum(OtpRequestType, { message: 'Loai OTP khong hop le' })
  type: OtpRequestType;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Thong tin lien he khong duoc de trong' })
  @IsString()
  @ValidateContact({ message: 'Contact phai la email hoac so dien thoai Viet Nam hop le' })
  contact: string;

  @IsNotEmpty({ message: 'Ma OTP khong duoc de trong' })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Mat khau moi khong duoc de trong' })
  @MinLength(6, { message: 'Mat khau toi thieu 6 ky tu' })
  newPassword: string;
}
