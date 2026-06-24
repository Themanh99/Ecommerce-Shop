import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { AuditAction, InventoryReason, OrderStatus, PaymentStatus, Role, VoucherType } from '@prisma/client';

export class ListQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ListUsersDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class UpdateUserActiveDto {
  @IsBoolean()
  isActive: boolean;
}

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.SALE;
}

export class DashboardRangeDto {
  @IsOptional()
  @IsEnum(['7d', '30d'])
  range?: '7d' | '30d' = '7d';
}

export class ListOrdersDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderPaymentDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ListReviewsDto extends ListQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isApproved?: boolean;
}

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEnum(VoucherType)
  type: VoucherType;

  @Type(() => Number)
  @Min(0)
  value: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minOrderValue?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxDiscount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perUserLimit?: number = 1;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @Type(() => Date)
  startsAt?: Date;

  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;
}

export class UpdateVoucherDto extends CreateVoucherDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(VoucherType)
  type: VoucherType;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  value: number;
}

export class ListInventoryDto extends ListQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStock?: boolean;
}

export class AdjustInventoryDto {
  @IsNotEmpty()
  @IsString()
  variantId: string;

  @Type(() => Number)
  @IsInt()
  delta: number;

  @IsOptional()
  @IsEnum(InventoryReason)
  reason?: InventoryReason = InventoryReason.MANUAL_ADJUST;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ListAuditLogsDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  entity?: string;
}
