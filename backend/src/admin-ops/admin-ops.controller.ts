import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AdminOpsService } from './admin-ops.service';
import {
  AdjustInventoryDto,
  CancelOrderDto,
  CreateStaffDto,
  CreateVoucherDto,
  DashboardRangeDto,
  ListAuditLogsDto,
  ListInventoryDto,
  ListOrdersDto,
  ListQueryDto,
  ListReviewsDto,
  ListUsersDto,
  UpdateOrderPaymentDto,
  UpdateOrderStatusDto,
  UpdateUserActiveDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateVoucherDto,
} from './dto/admin-ops.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SALE)
export class AdminOpsController {
  constructor(private readonly admin: AdminOpsService) {}

  @Get('dashboard/summary')
  getSummary() {
    return this.admin.getSummary();
  }

  @Get('dashboard/revenue')
  getRevenue(@Query() query: DashboardRangeDto) {
    return this.admin.getRevenue(query);
  }

  @Get('dashboard/orders-by-status')
  getOrdersByStatus() {
    return this.admin.getOrdersByStatus();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  listUsers(@Query() query: ListUsersDto) {
    return this.admin.listUsers(query);
  }

  @Get('users/:id')
  @Roles(Role.ADMIN)
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id')
  @Roles(Role.ADMIN)
  updateUser(@GetUser('sub') actorId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.admin.updateUser(actorId, id, dto);
  }

  @Patch('users/:id/role')
  @Roles(Role.ADMIN)
  updateUserRole(
    @GetUser('sub') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.admin.updateUserRole(actorId, id, dto);
  }

  @Patch('users/:id/active')
  @Roles(Role.ADMIN)
  updateUserActive(
    @GetUser('sub') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserActiveDto,
  ) {
    return this.admin.updateUserActive(actorId, id, dto);
  }

  @Post('users/staff')
  @Roles(Role.ADMIN)
  createStaff(@GetUser('sub') actorId: string, @Body() dto: CreateStaffDto) {
    return this.admin.createStaff(actorId, dto);
  }

  @Get('orders')
  listOrders(@Query() query: ListOrdersDto) {
    return this.admin.listOrders(query);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.admin.getOrder(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @GetUser('sub') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(actorId, id, dto);
  }

  @Patch('orders/:id/payment')
  updateOrderPayment(
    @GetUser('sub') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderPaymentDto,
  ) {
    return this.admin.updateOrderPayment(actorId, id, dto);
  }

  @Patch('orders/:id/cancel')
  cancelOrder(@GetUser('sub') actorId: string, @Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.admin.cancelOrder(actorId, id, dto);
  }

  @Get('reviews')
  listReviews(@Query() query: ListReviewsDto) {
    return this.admin.listReviews(query);
  }

  @Patch('reviews/:id/approve')
  approveReview(@GetUser('sub') actorId: string, @Param('id') id: string) {
    return this.admin.setReviewApproval(actorId, id, true);
  }

  @Patch('reviews/:id/reject')
  rejectReview(@GetUser('sub') actorId: string, @Param('id') id: string) {
    return this.admin.setReviewApproval(actorId, id, false);
  }

  @Get('vouchers')
  listVouchers(@Query() query: ListQueryDto) {
    return this.admin.listVouchers(query);
  }

  @Post('vouchers')
  @Roles(Role.ADMIN)
  createVoucher(@GetUser('sub') actorId: string, @Body() dto: CreateVoucherDto) {
    return this.admin.createVoucher(actorId, dto);
  }

  @Patch('vouchers/:id')
  @Roles(Role.ADMIN)
  updateVoucher(
    @GetUser('sub') actorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVoucherDto,
  ) {
    return this.admin.updateVoucher(actorId, id, dto);
  }

  @Delete('vouchers/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  deleteVoucher(@GetUser('sub') actorId: string, @Param('id') id: string) {
    return this.admin.deleteVoucher(actorId, id);
  }

  @Get('inventory')
  listInventory(@Query() query: ListInventoryDto) {
    return this.admin.listInventory(query);
  }

  @Post('inventory/adjust')
  @Roles(Role.ADMIN)
  adjustInventory(@GetUser('sub') actorId: string, @Body() dto: AdjustInventoryDto) {
    return this.admin.adjustInventory(actorId, dto);
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN)
  listAuditLogs(@Query() query: ListAuditLogsDto) {
    return this.admin.listAuditLogs(query);
  }
}
