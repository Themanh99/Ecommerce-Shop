import api from './api';

export type AdminRole = 'ADMIN' | 'SALE' | 'USER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DONE' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type VoucherType = 'PERCENT' | 'FIXED';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: AdminRole;
  isActive: boolean;
  avatar?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrder = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminReview = {
  id: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  product?: { id: string; name: string; slug: string } | null;
  user?: { id: string; name: string; email?: string | null } | null;
};

export type AdminVoucher = {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string; email?: string | null } | null;
};

export type InventoryItem = {
  id: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  stockReserved: number;
  stockAvailable: number;
  isLowStock: boolean;
  isActive: boolean;
  updatedAt: string;
  product: { id: string; name: string; slug: string };
  optionLabel: string;
};

export type AuditLogItem = {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string | null;
  createdAt: string;
  user: { id: string; name: string; email?: string | null; role: AdminRole };
};

export type DashboardSummary = {
  metrics: {
    revenueToday: number;
    revenueMonth: number;
    pendingOrders: number;
    shippingOrders: number;
    totalCustomers: number;
    activeProducts: number;
    lowStockVariants: number;
    pendingReviews: number;
  };
  catalog: {
    products: number;
    activeProducts: number;
    inactiveProducts: number;
    categories: number;
    tags: number;
    banners: number;
    activeBanners: number;
  };
  todo: {
    pendingOrders: AdminOrder[];
    lowStockVariants: InventoryItem[];
    pendingReviews: AdminReview[];
    inactiveBanners: Array<{ id: string; title: string; imageUrl: string }>;
  };
  recentActivity: AuditLogItem[];
};

export type RevenuePoint = { date: string; revenue: number; orders: number };
export type StatusPoint = { status: OrderStatus; count: number };
export type Paginated<T> = { items: T[]; pagination: Pagination };

export const adminOpsApi = {
  summary: () => api.get<DashboardSummary>('/admin/dashboard/summary').then((res) => res.data),
  revenue: (range: '7d' | '30d' = '7d') =>
    api.get<RevenuePoint[]>('/admin/dashboard/revenue', { params: { range } }).then((res) => res.data),
  ordersByStatus: () =>
    api.get<StatusPoint[]>('/admin/dashboard/orders-by-status').then((res) => res.data),

  users: (params?: Record<string, unknown>) =>
    api.get<Paginated<AdminUser>>('/admin/users', { params }).then((res) => res.data),
  user: (id: string) => api.get<AdminUser>(`/admin/users/${id}`).then((res) => res.data),
  updateUser: (id: string, payload: Partial<Pick<AdminUser, 'name' | 'email' | 'phone'>>) =>
    api.patch<AdminUser>(`/admin/users/${id}`, payload).then((res) => res.data),
  updateUserRole: (id: string, role: AdminRole) =>
    api.patch<AdminUser>(`/admin/users/${id}/role`, { role }).then((res) => res.data),
  updateUserActive: (id: string, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/active`, { isActive }).then((res) => res.data),
  createStaff: (payload: { name: string; email: string; phone?: string; password: string; role?: AdminRole }) =>
    api.post<AdminUser>('/admin/users/staff', payload).then((res) => res.data),

  orders: (params?: Record<string, unknown>) =>
    api.get<Paginated<AdminOrder>>('/admin/orders', { params }).then((res) => res.data),
  order: (id: string) => api.get(`/admin/orders/${id}`).then((res) => res.data),
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) =>
    api.patch<AdminOrder>(`/admin/orders/${id}/status`, { status, note }).then((res) => res.data),
  updateOrderPayment: (id: string, paymentStatus: PaymentStatus) =>
    api.patch<AdminOrder>(`/admin/orders/${id}/payment`, { paymentStatus }).then((res) => res.data),
  cancelOrder: (id: string, reason?: string) =>
    api.patch<AdminOrder>(`/admin/orders/${id}/cancel`, { reason }).then((res) => res.data),

  reviews: (params?: Record<string, unknown>) =>
    api.get<Paginated<AdminReview>>('/admin/reviews', { params }).then((res) => res.data),
  approveReview: (id: string) => api.patch(`/admin/reviews/${id}/approve`).then((res) => res.data),
  rejectReview: (id: string) => api.patch(`/admin/reviews/${id}/reject`).then((res) => res.data),

  vouchers: (params?: Record<string, unknown>) =>
    api.get<Paginated<AdminVoucher>>('/admin/vouchers', { params }).then((res) => res.data),
  createVoucher: (payload: Partial<AdminVoucher>) =>
    api.post<AdminVoucher>('/admin/vouchers', payload).then((res) => res.data),
  updateVoucher: (id: string, payload: Partial<AdminVoucher>) =>
    api.patch<AdminVoucher>(`/admin/vouchers/${id}`, payload).then((res) => res.data),
  deleteVoucher: (id: string) => api.delete(`/admin/vouchers/${id}`).then((res) => res.data),

  inventory: (params?: Record<string, unknown>) =>
    api.get<Paginated<InventoryItem>>('/admin/inventory', { params }).then((res) => res.data),
  adjustInventory: (payload: { variantId: string; delta: number; reason?: string; note?: string }) =>
    api.post('/admin/inventory/adjust', payload).then((res) => res.data),

  auditLogs: (params?: Record<string, unknown>) =>
    api.get<Paginated<AuditLogItem>>('/admin/audit-logs', { params }).then((res) => res.data),
};
