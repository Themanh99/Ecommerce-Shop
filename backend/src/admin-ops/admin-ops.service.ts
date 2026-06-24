import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  InventoryReason,
  OrderStatus,
  PaymentStatus,
  Prisma,
  Role,
  VoucherType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
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

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class AdminOpsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueToday,
      revenueMonth,
      pendingOrders,
      shippingOrders,
      totalCustomers,
      activeProducts,
      totalProducts,
      inactiveProducts,
      categories,
      tags,
      banners,
      activeBanners,
      pendingReviews,
      lowStockVariants,
      todoPendingOrders,
      todoLowStock,
      todoPendingReviews,
      todoInactiveBanners,
      recentActivity,
    ] = await Promise.all([
      this.sumRevenue(startOfToday),
      this.sumRevenue(startOfMonth),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPING } }),
      this.prisma.user.count({ where: { role: Role.USER } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: false } }),
      this.prisma.category.count(),
      this.prisma.tag.count(),
      this.prisma.banner.count(),
      this.prisma.banner.count({ where: { isActive: true } }),
      this.prisma.review.count({ where: { isApproved: false } }),
      this.prisma.productVariant.count({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      }),
      this.prisma.order.findMany({
        where: { status: OrderStatus.PENDING },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.productVariant.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        include: { product: true },
        orderBy: { stock: 'asc' },
        take: 8,
      }),
      this.prisma.review.findMany({
        where: { isApproved: false },
        include: { product: true, user: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.banner.findMany({
        where: { isActive: false },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.auditLog.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      metrics: {
        revenueToday,
        revenueMonth,
        pendingOrders,
        shippingOrders,
        totalCustomers,
        activeProducts,
        lowStockVariants,
        pendingReviews,
      },
      catalog: {
        products: totalProducts,
        activeProducts,
        inactiveProducts,
        categories,
        tags,
        banners,
        activeBanners,
      },
      todo: {
        pendingOrders: todoPendingOrders.map((order) => this.toOrderListItem(order)),
        lowStockVariants: todoLowStock.map((variant) => this.toInventoryItem(variant)),
        pendingReviews: todoPendingReviews.map((review) => this.toReviewItem(review)),
        inactiveBanners: todoInactiveBanners,
      },
      recentActivity: recentActivity.map((log) => this.toAuditLogItem(log)),
    };
  }

  async getRevenue(query: DashboardRangeDto) {
    const days = query.range === '30d' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        OR: [{ status: OrderStatus.DONE }, { paymentStatus: PaymentStatus.PAID }],
      },
      select: { total: true, createdAt: true },
    });

    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(since);
      date.setDate(since.getDate() + index);
      return {
        date: date.toISOString().slice(0, 10),
        revenue: 0,
        orders: 0,
      };
    });
    const byDate = new Map(buckets.map((bucket) => [bucket.date, bucket]));

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().slice(0, 10);
      const bucket = byDate.get(date);
      if (bucket) {
        bucket.revenue += Number(order.total);
        bucket.orders += 1;
      }
    });

    return buckets;
  }

  async getOrdersByStatus() {
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return Object.values(OrderStatus).map((status) => ({
      status,
      count: grouped.find((item) => item.status === status)?._count._all ?? 0,
    }));
  }

  async listUsers(query: ListUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
              { phone: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: users.map((user) => this.toUserItem(user)),
      pagination: this.pagination(page, limit, total),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        addresses: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return {
      ...this.toUserItem(user),
      addresses: user.addresses,
      recentOrders: user.orders.map((order) => this.toOrderListItem(order)),
    };
  }

  async updateUser(actorId: string, id: string, dto: UpdateUserDto) {
    const before = await this.prisma.user.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy người dùng');
    const updated = await this.prisma.user.update({ where: { id }, data: dto });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'User', id, before, updated);
    return this.toUserItem(updated);
  }

  async updateUserRole(actorId: string, id: string, dto: UpdateUserRoleDto) {
    if (actorId === id && dto.role !== Role.ADMIN) {
      throw new BadRequestException('Không thể tự hạ quyền ADMIN của chính mình');
    }
    const before = await this.prisma.user.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy người dùng');
    const updated = await this.prisma.user.update({ where: { id }, data: { role: dto.role } });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'User', id, before, updated);
    return this.toUserItem(updated);
  }

  async updateUserActive(actorId: string, id: string, dto: UpdateUserActiveDto) {
    if (actorId === id && !dto.isActive) {
      throw new BadRequestException('Không thể tự khóa tài khoản đang đăng nhập');
    }
    const before = await this.prisma.user.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy người dùng');
    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: { isActive: dto.isActive } });
      if (!dto.isActive) {
        await tx.refreshToken.deleteMany({ where: { userId: id } });
      }
      return user;
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'User', id, before, updated);
    return this.toUserItem(updated);
  }

  async createStaff(actorId: string, dto: CreateStaffDto) {
    const role = dto.role ?? Role.SALE;
    if (role === Role.USER) throw new BadRequestException('Tài khoản nhân sự phải là ADMIN hoặc SALE');
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    });
    if (existing) throw new ConflictException('Email hoặc số điện thoại đã tồn tại');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role,
        password,
        isActive: true,
        isEmailVerified: true,
        cart: { create: {} },
      },
    });
    await this.writeAudit(actorId, AuditAction.CREATE, 'User', user.id, null, user);
    return this.toUserItem(user);
  }

  async listOrders(query: ListOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.q
        ? {
            OR: [
              { code: { contains: query.q, mode: 'insensitive' } },
              { customerName: { contains: query.q, mode: 'insensitive' } },
              { customerPhone: { contains: query.q, mode: 'insensitive' } },
              { customerEmail: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items: orders.map((order) => this.toOrderListItem(order)), pagination: this.pagination(page, limit, total) };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        voucher: true,
        statusLogs: { include: { createdBy: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return {
      ...this.toOrderListItem(order),
      user: order.user ? this.toUserItem(order.user) : null,
      voucher: order.voucher,
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
      statusLogs: order.statusLogs.map((log) => ({
        id: log.id,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        note: log.note,
        createdAt: log.createdAt,
        createdBy: this.toUserItem(log.createdBy),
      })),
    };
  }

  async updateOrderStatus(actorId: string, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    this.assertStatusTransition(order.status, dto.status);
    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          confirmedAt: dto.status === OrderStatus.CONFIRMED ? new Date() : order.confirmedAt,
          shippedAt: dto.status === OrderStatus.SHIPPING ? new Date() : order.shippedAt,
          completedAt: dto.status === OrderStatus.DONE ? new Date() : order.completedAt,
        },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: dto.status,
          note: dto.note,
          createdById: actorId,
        },
      });
      return saved;
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'Order', id, order, updated);
    return this.toOrderListItem(updated);
  }

  async updateOrderPayment(actorId: string, id: string, dto: UpdateOrderPaymentDto) {
    const before = await this.prisma.order.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy đơn hàng');
    const updated = await this.prisma.order.update({
      where: { id },
      data: { paymentStatus: dto.paymentStatus },
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'Order', id, before, updated);
    return this.toOrderListItem(updated);
  }

  async cancelOrder(actorId: string, id: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể hủy đơn đang chờ hoặc đã xác nhận');
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: dto.reason,
          cancelledAt: new Date(),
        },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          note: dto.reason,
          createdById: actorId,
        },
      });
      return saved;
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'Order', id, order, updated);
    return this.toOrderListItem(updated);
  }

  async listReviews(query: ListReviewsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ReviewWhereInput = {
      ...(query.isApproved !== undefined ? { isApproved: query.isApproved } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { content: { contains: query.q, mode: 'insensitive' } },
              { product: { name: { contains: query.q, mode: 'insensitive' } } },
              { user: { name: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        include: { product: true, user: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items: reviews.map((review) => this.toReviewItem(review)), pagination: this.pagination(page, limit, total) };
  }

  async setReviewApproval(actorId: string, id: string, isApproved: boolean) {
    const before = await this.prisma.review.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy đánh giá');
    const updated = await this.prisma.review.update({ where: { id }, data: { isApproved } });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'Review', id, before, updated);
    return updated;
  }

  async listVouchers(query: ListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.VoucherWhereInput = query.q
      ? { code: { contains: query.q, mode: 'insensitive' } }
      : {};
    const [total, vouchers] = await Promise.all([
      this.prisma.voucher.count({ where }),
      this.prisma.voucher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { createdBy: true },
      }),
    ]);
    return {
      items: vouchers.map((voucher) => this.toVoucherItem(voucher)),
      pagination: this.pagination(page, limit, total),
    };
  }

  async createVoucher(actorId: string, dto: CreateVoucherDto) {
    const voucher = await this.prisma.voucher.create({
      data: this.toVoucherCreateInput(actorId, dto),
      include: { createdBy: true },
    });
    await this.writeAudit(actorId, AuditAction.CREATE, 'Voucher', voucher.id, null, voucher);
    return this.toVoucherItem(voucher);
  }

  async updateVoucher(actorId: string, id: string, dto: UpdateVoucherDto) {
    const before = await this.prisma.voucher.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy voucher');
    const updated = await this.prisma.voucher.update({
      where: { id },
      data: this.toVoucherUpdateInput(dto),
      include: { createdBy: true },
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'Voucher', id, before, updated);
    return this.toVoucherItem(updated);
  }

  async deleteVoucher(actorId: string, id: string) {
    const before = await this.prisma.voucher.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Không tìm thấy voucher');
    await this.prisma.voucher.delete({ where: { id } });
    await this.writeAudit(actorId, AuditAction.DELETE, 'Voucher', id, before, null);
    return { success: true };
  }

  async listInventory(query: ListInventoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductVariantWhereInput = {
      ...(query.lowStock ? { stock: { lte: LOW_STOCK_THRESHOLD } } : {}),
      ...(query.q
        ? {
            OR: [
              { sku: { contains: query.q, mode: 'insensitive' } },
              { product: { name: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, variants] = await Promise.all([
      this.prisma.productVariant.count({ where }),
      this.prisma.productVariant.findMany({
        where,
        include: {
          product: true,
          options: { include: { optionValue: { include: { optionType: true } } } },
        },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      items: variants.map((variant) => this.toInventoryItem(variant)),
      pagination: this.pagination(page, limit, total),
    };
  }

  async adjustInventory(actorId: string, dto: AdjustInventoryDto) {
    const before = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
    if (!before) throw new NotFoundException('Không tìm thấy biến thể');
    const updated = await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: { increment: dto.delta } },
      });
      await tx.inventoryLog.create({
        data: {
          variantId: dto.variantId,
          delta: dto.delta,
          afterQty: variant.stock,
          reason: dto.reason ?? InventoryReason.MANUAL_ADJUST,
          note: dto.note,
          createdById: actorId,
        },
      });
      return variant;
    });
    await this.writeAudit(actorId, AuditAction.UPDATE, 'ProductVariant', dto.variantId, before, updated);
    return updated;
  }

  async listAuditLogs(query: ListAuditLogsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.q
        ? {
            OR: [
              { entity: { contains: query.q, mode: 'insensitive' } },
              { entityId: { contains: query.q, mode: 'insensitive' } },
              { user: { name: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items: logs.map((log) => this.toAuditLogItem(log)), pagination: this.pagination(page, limit, total) };
  }

  private async sumRevenue(since: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: { gte: since },
        OR: [{ status: OrderStatus.DONE }, { paymentStatus: PaymentStatus.PAID }],
      },
      _sum: { total: true },
    });
    return Number(result._sum.total ?? 0);
  }

  private assertStatusTransition(from: OrderStatus, to: OrderStatus) {
    if (from === to) return;
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING],
      [OrderStatus.SHIPPING]: [OrderStatus.DONE],
      [OrderStatus.DONE]: [],
      [OrderStatus.CANCELLED]: [],
    };
    if (!transitions[from].includes(to)) {
      throw new BadRequestException(`Không thể chuyển đơn từ ${from} sang ${to}`);
    }
  }

  private async writeAudit(
    userId: string,
    action: AuditAction,
    entity: string,
    entityId: string,
    before: unknown,
    after: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        before: this.toJson(before),
        after: this.toJson(after),
      },
    });
  }

  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private pagination(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  private toUserItem(user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: Role;
    isActive: boolean;
    avatar: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toOrderListItem(order: {
    id: string;
    code: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    subtotal: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    shippingFee: Prisma.Decimal;
    total: Prisma.Decimal;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: order.id,
      code: order.code,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toReviewItem(review: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    isApproved: boolean;
    helpfulCount: number;
    createdAt: Date;
    product?: { id: string; name: string; slug: string } | null;
    user?: { id: string; name: string; email: string | null } | null;
  }) {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      isApproved: review.isApproved,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt,
      product: review.product
        ? { id: review.product.id, name: review.product.name, slug: review.product.slug }
        : null,
      user: review.user
        ? { id: review.user.id, name: review.user.name, email: review.user.email }
        : null,
    };
  }

  private toVoucherCreateInput(userId: string, dto: CreateVoucherDto): Prisma.VoucherCreateInput {
    return {
      code: dto.code.trim().toUpperCase(),
      type: dto.type,
      value: dto.value,
      minOrderValue: dto.minOrderValue ?? 0,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      perUserLimit: dto.perUserLimit ?? 1,
      isActive: dto.isActive ?? true,
      isPublic: dto.isPublic ?? false,
      startsAt: dto.startsAt,
      expiresAt: dto.expiresAt,
      createdBy: { connect: { id: userId } },
    };
  }

  private toVoucherUpdateInput(dto: UpdateVoucherDto): Prisma.VoucherUpdateInput {
    return {
      ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
      ...(dto.type ? { type: dto.type as VoucherType } : {}),
      ...(dto.value !== undefined ? { value: dto.value } : {}),
      ...(dto.minOrderValue !== undefined ? { minOrderValue: dto.minOrderValue } : {}),
      ...(dto.maxDiscount !== undefined ? { maxDiscount: dto.maxDiscount } : {}),
      ...(dto.usageLimit !== undefined ? { usageLimit: dto.usageLimit } : {}),
      ...(dto.perUserLimit !== undefined ? { perUserLimit: dto.perUserLimit } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt } : {}),
      ...(dto.expiresAt !== undefined ? { expiresAt: dto.expiresAt } : {}),
    };
  }

  private toVoucherItem(voucher: {
    id: string;
    code: string;
    type: VoucherType;
    value: Prisma.Decimal;
    minOrderValue: Prisma.Decimal;
    maxDiscount: Prisma.Decimal | null;
    usageLimit: number | null;
    perUserLimit: number;
    usedCount: number;
    isActive: boolean;
    isPublic: boolean;
    startsAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
    createdBy?: { id: string; name: string; email: string | null } | null;
  }) {
    return {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: Number(voucher.value),
      minOrderValue: Number(voucher.minOrderValue),
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
      usageLimit: voucher.usageLimit,
      perUserLimit: voucher.perUserLimit,
      usedCount: voucher.usedCount,
      isActive: voucher.isActive,
      isPublic: voucher.isPublic,
      startsAt: voucher.startsAt,
      expiresAt: voucher.expiresAt,
      createdAt: voucher.createdAt,
      createdBy: voucher.createdBy
        ? { id: voucher.createdBy.id, name: voucher.createdBy.name, email: voucher.createdBy.email }
        : null,
    };
  }

  private toInventoryItem(variant: {
    id: string;
    sku: string;
    price: Prisma.Decimal;
    comparePrice: Prisma.Decimal | null;
    stock: number;
    stockReserved: number;
    isActive: boolean;
    updatedAt: Date;
    product: { id: string; name: string; slug: string };
    options?: Array<{
      optionValue: { value: string; optionType: { name: string } };
    }>;
  }) {
    return {
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.price),
      comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
      stock: variant.stock,
      stockReserved: variant.stockReserved,
      stockAvailable: variant.stock - variant.stockReserved,
      isLowStock: variant.stock - variant.stockReserved <= LOW_STOCK_THRESHOLD,
      isActive: variant.isActive,
      updatedAt: variant.updatedAt,
      product: variant.product,
      optionLabel: variant.options?.map((option) => option.optionValue.value).join(' / ') ?? '',
    };
  }

  private toAuditLogItem(log: {
    id: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    before: Prisma.JsonValue | null;
    after: Prisma.JsonValue | null;
    ipAddress: string | null;
    createdAt: Date;
    user: { id: string; name: string; email: string | null; role: Role };
  }) {
    return {
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      before: log.before,
      after: log.after,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
      user: { id: log.user.id, name: log.user.name, email: log.user.email, role: log.user.role },
    };
  }
}
