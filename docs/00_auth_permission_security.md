# 🔐 Phân quyền & Bảo mật — Role / Permission / Security

> **Cập nhật:** 2026-06-23  
> **Áp dụng cho:** Backend (NestJS Guard/Decorator) + Frontend (Route Guard)

---

## 1. Mô hình Phân quyền (RBAC — Role-Based Access Control)

### 1.1 Các Role trong hệ thống

| Role | Mô tả | Cách tạo |
|------|--------|----------|
| `ADMIN` | Chủ shop — toàn quyền hệ thống | Seed vào DB lần đầu (duy nhất 1 tài khoản, hoặc chỉ ADMIN tạo ADMIN mới) |
| `SALE` | Nhân viên bán hàng — quản lý SP + đơn hàng | Admin tạo tài khoản và cấp role |
| `USER` | Khách hàng — mua hàng, xem đơn hàng | Tự đăng ký qua Storefront |

### 1.2 Ma trận Quyền Chi tiết

#### A. Auth & Account

| Chức năng | Guest | USER | SALE | ADMIN |
|-----------|-------|------|------|-------|
| Đăng ký tài khoản (register) | ✅ | ❌ | ❌ | ❌ |
| Đăng nhập (email/phone + password) | ✅ | ✅ | ✅ | ✅ |
| Đăng nhập bằng OTP | ✅ | ✅ | ❌ | ❌ |
| Đăng nhập bằng Google OAuth | ✅ | ✅ | ❌ | ❌ |
| Quên mật khẩu (reset password) | ❌ | ✅ | ✅ | ✅ |
| Đổi mật khẩu | ❌ | ✅ | ✅ | ✅ |
| Cập nhật profile (tên, avatar) | ❌ | ✅ | ✅ | ✅ |
| Xác thực SĐT (verify phone) | ❌ | ✅ | ❌ | ❌ |
| Logout | ❌ | ✅ | ✅ | ✅ |

#### B. Storefront (Giao diện Khách hàng)

| Chức năng | Guest | USER | SALE | ADMIN |
|-----------|-------|------|------|-------|
| Xem trang chủ, banner, danh mục | ✅ | ✅ | ✅ | ✅ |
| Xem danh sách sản phẩm + filter | ✅ | ✅ | ✅ | ✅ |
| Xem chi tiết sản phẩm | ✅ | ✅ | ✅ | ✅ |
| Xem review/đánh giá | ✅ | ✅ | ✅ | ✅ |
| Thêm vào giỏ hàng | ✅ (localStorage) | ✅ (DB) | ❌ | ❌ |
| **Đặt hàng (checkout)** | **❌ (phải đăng nhập)** | **✅** | ❌ | ❌ |
| Xem đơn hàng của mình | ❌ | ✅ | ❌ | ❌ |
| Hủy đơn hàng (chỉ khi pending) | ❌ | ✅ | ❌ | ❌ |
| Viết review (sau khi mua xong) | ❌ | ✅ | ❌ | ❌ |
| Quản lý sổ địa chỉ | ❌ | ✅ | ❌ | ❌ |
| Áp dụng mã giảm giá (voucher) | ❌ | ✅ | ❌ | ❌ |

#### C. Admin Panel — Quản lý Sản phẩm

| Chức năng | SALE | ADMIN |
|-----------|------|-------|
| Xem danh sách sản phẩm | ✅ | ✅ |
| Thêm sản phẩm mới | ✅ | ✅ |
| Sửa sản phẩm | ✅ | ✅ |
| Xóa sản phẩm (soft delete) | ❌ | ✅ |
| Upload ảnh sản phẩm lên MinIO | ✅ | ✅ |
| Import sản phẩm từ Excel | ✅ | ✅ |
| Export sản phẩm ra Excel | ✅ | ✅ |
| Quản lý danh mục (Category CRUD) | ❌ | ✅ |
| Quản lý Tag | ❌ | ✅ |
| Quản lý bảng size | ✅ | ✅ |

#### D. Admin Panel — Quản lý Tồn kho

| Chức năng | SALE | ADMIN |
|-----------|------|-------|
| Xem tồn kho tổng | ✅ | ✅ |
| Xem tồn kho theo variant | ✅ | ✅ |
| Nhập hàng (import stock) | ❌ | ✅ |
| Điều chỉnh tồn kho thủ công | ❌ | ✅ |
| Xem lịch sử biến động kho | ✅ (chỉ xem) | ✅ |
| Cảnh báo hết hàng / sắp hết | ✅ | ✅ |

#### E. Admin Panel — Quản lý Đơn hàng

| Chức năng | SALE | ADMIN |
|-----------|------|-------|
| Xem danh sách đơn hàng | ✅ | ✅ |
| Xem chi tiết đơn hàng | ✅ | ✅ |
| Tìm kiếm đơn (theo mã, SĐT, tên) | ✅ | ✅ |
| Xác nhận đơn (pending → confirmed) | ✅ | ✅ |
| Chuyển trạng thái (confirmed → processing → shipping) | ✅ | ✅ |
| Hoàn thành đơn (shipping → done) | ✅ | ✅ |
| **Hủy đơn hàng** | ❌ | ✅ |
| Xác nhận đã thu tiền (bank transfer) | ✅ | ✅ |
| Cập nhật phí ship | ✅ | ✅ |
| In/xuất đơn hàng | ✅ | ✅ |

#### F. Admin Panel — Dashboard & Thống kê

| Chức năng | SALE | ADMIN |
|-----------|------|-------|
| **Dashboard tổng doanh thu** | **❌** | **✅** |
| **Biểu đồ doanh thu theo thời gian** | **❌** | **✅** |
| **Top sản phẩm bán chạy** | **❌** | **✅** |
| **Thống kê khách hàng mới** | **❌** | **✅** |
| Thống kê đơn hàng (số lượng theo status) | ✅ | ✅ |
| **Báo cáo lợi nhuận** | **❌** | **✅** |

#### G. Admin Panel — Quản lý Hệ thống

| Chức năng | SALE | ADMIN |
|-----------|------|-------|
| **Quản lý tài khoản Sale (CRUD)** | **❌** | **✅** |
| **Ban/Deactivate Sale** | **❌** | **✅** |
| Quản lý Banner | ❌ | ✅ |
| **Quản lý Voucher (CRUD)** | **❌** | **✅** |
| Xem Audit Log | ❌ | ✅ |
| **Cấu hình hệ thống (phí ship, thời gian auto-cancel)** | **❌** | **✅** |
| Quản lý danh sách khách hàng | ❌ | ✅ |
| Duyệt review | ❌ | ✅ |

---

## 2. Cơ chế Authentication (Xác thực)

### 2.1 JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN ARCHITECTURE                        │
│                                                              │
│  Access Token (AT)                Refresh Token (RT)         │
│  ├── Lưu: HttpOnly Cookie         ├── Lưu: HttpOnly Cookie  │
│  ├── TTL: 15 phút                 ├── TTL: 7 ngày           │
│  ├── Payload: {sub, role, jti}     ├── Payload: {sub, jti}   │
│  └── Dùng: mỗi API request        └── Dùng: đổi AT mới      │
│                                                              │
│  Cookie Flags (PRODUCTION):                                  │
│  ├── HttpOnly: true    ← JS không đọc được (chống XSS)      │
│  ├── Secure: true      ← Chỉ gửi qua HTTPS                 │
│  ├── SameSite: Strict  ← Chống CSRF                         │
│  └── Path: /api        ← Chỉ gửi khi gọi API               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Luồng Xác thực Chi tiết

```
Client                    Backend                    Redis              DB
  │                         │                          │                 │
  │── POST /auth/login ────▶│                          │                 │
  │   {email, password}     │── bcrypt.compare ───────────────────────▶│
  │                         │                          │    User found   │
  │                         │◀────────────────────────────── return ───│
  │                         │                          │                 │
  │                         │── Generate AT + RT       │                 │
  │                         │── Store RT in DB ────────────────────────▶│
  │                         │                          │                 │
  │◀── Set-Cookie: AT, RT ──│                          │                 │
  │                         │                          │                 │
  │── GET /api/products ───▶│                          │                 │
  │   (Cookie auto-sent)    │── Verify AT (JWT)        │                 │
  │                         │── Check blacklist ──────▶│                 │
  │                         │◀── NOT blacklisted ─────│                 │
  │                         │── Process request        │                 │
  │◀── 200 OK ─────────────│                          │                 │
  │                         │                          │                 │
  │── GET /api/xxx ────────▶│  (AT expired!)           │                 │
  │◀── 401 Unauthorized ───│                          │                 │
  │                         │                          │                 │
  │── POST /auth/refresh ──▶│                          │                 │
  │   (RT Cookie)           │── Verify RT              │                 │
  │                         │── Check blacklist ──────▶│                 │
  │                         │◀── OK ──────────────────│                 │
  │                         │── Blacklist old RT ─────▶│  (rotation)     │
  │                         │── Generate new AT + RT   │                 │
  │◀── Set-Cookie: new ────│                          │                 │
```

### 2.3 Token Blacklist (Redis)

```typescript
// Key format
`blacklist:${jti}`          // jti = JWT ID (unique per token)

// Operations
SET blacklist:{jti} "1" EX {remaining_ttl}   // Add to blacklist
EXISTS blacklist:{jti}                        // Check if blacklisted

// Use cases:
// 1. Logout → blacklist current RT
// 2. Refresh token rotation → blacklist old RT  
// 3. Ban user → blacklist ALL active RTs of that user
// 4. Password change → blacklist ALL active RTs
```

### 2.4 Refresh Token Rotation (Chống token theft)

```
Mỗi lần dùng RT để lấy AT mới:
1. RT cũ bị blacklist ngay lập tức
2. RT mới được cấp
3. Nếu ai đó dùng RT cũ (đã blacklist) → ALERT: token bị đánh cắp!
   → Blacklist TẤT CẢ RT của user đó
   → Force re-login
```

---

## 3. Cơ chế Authorization (Phân quyền)

### 3.1 NestJS Guard + Decorator Pattern

```typescript
// ─── Custom Decorators ──────────────────────
@Roles(Role.ADMIN)                    // Chỉ admin
@Roles(Role.ADMIN, Role.SALE)         // Admin hoặc Sale
@Public()                             // Không cần auth
@CurrentUser()                        // Inject user vào param

// ─── Guards (thứ tự thực thi) ───────────────
1. JwtAuthGuard        → Verify JWT, extract user
2. RolesGuard          → Check role từ JWT payload
3. ThrottlerGuard      → Rate limiting (global)

// ─── Ví dụ Controller ──────────────────────
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SALE)
export class AdminProductController {

  @Post()
  @Roles(Role.ADMIN, Role.SALE)  // Cả hai role đều thêm SP được
  create(@Body() dto: CreateProductDto) {}

  @Delete(':id')
  @Roles(Role.ADMIN)  // ⚠️ CHỈ ADMIN mới xóa được
  delete(@Param('id') id: string) {}
}

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)  // ⚠️ TOÀN BỘ Dashboard chỉ ADMIN
export class DashboardController {
  @Get('revenue')
  getRevenue() {}  // Sale không bao giờ thấy
}
```

### 3.2 Frontend Route Guard

```typescript
// React Router protection
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      // ADMIN + SALE đều vào được
      { path: 'products', element: <ProductList /> },
      { path: 'orders', element: <OrderList /> },
      
      // ⚠️ CHỈ ADMIN
      { path: 'dashboard', element: <AdminOnly><Dashboard /></AdminOnly> },
      { path: 'users', element: <AdminOnly><UserManagement /></AdminOnly> },
      { path: 'vouchers', element: <AdminOnly><VoucherManagement /></AdminOnly> },
      { path: 'settings', element: <AdminOnly><SystemSettings /></AdminOnly> },
    ]
  }
];

// Guard component
function AdminOnly({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/admin/orders" />;
  return children;
}
```

> ⚠️ **QUAN TRỌNG:** Frontend guard chỉ là UX — Backend PHẢI kiểm tra role ở mọi API endpoint. Không bao giờ tin frontend.

---

## 4. Các Vấn đề Bảo mật Đặc biệt

### 4.1 Anti-Tampering (Chống sửa giá client-side)

```
❌ KHÔNG BAO GIỜ tin Frontend gửi lên:
   • Giá sản phẩm
   • Tổng tiền đơn hàng
   • Số tiền giảm giá
   
✅ Backend PHẢI tự tính:
   1. Nhận variantId + quantity từ client
   2. Query DB lấy giá thực tế của variant
   3. Tính subtotal = Σ(price × quantity)
   4. Validate voucher → tính discountAmount
   5. total = subtotal - discountAmount + shippingFee
```

### 4.2 Rate Limiting

```typescript
// Global rate limiting
ThrottlerModule.forRoot([
  { ttl: 60_000, limit: 60 }        // 60 requests/phút cho mọi API
]);

// Endpoint-specific (stricter)
@Throttle({ default: { ttl: 60_000, limit: 5 } })  // 5 lần/phút
sendOtp() {}

@Throttle({ default: { ttl: 60_000, limit: 3 } })  // 3 lần/phút
login() {}

@Throttle({ default: { ttl: 3600_000, limit: 10 } }) // 10 lần/giờ
createOrder() {}
```

### 4.3 Input Validation (class-validator)

```typescript
// Mọi DTO phải validate chặt
class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @Matches(/^(0[1-9])\d{8}$/)  // SĐT Việt Nam
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // ⚠️ KHÔNG CÓ trường total, subtotal, price
  // Backend tự tính tất cả
}
```

### 4.4 Data Leak Prevention

```typescript
// KHÔNG BAO GIỜ trả về password hash, refresh token, internal IDs không cần thiết
// Dùng Prisma select/exclude hoặc class-transformer @Exclude()

@Exclude()
password: string;

@Exclude()
googleId: string;

// Hoặc dùng Prisma select
prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true, role: true, avatar: true }
  // KHÔNG select password, googleId
});
```

### 4.5 Ban / Deactivate Flow

```
Admin bấm "Ban" user (Sale hoặc User):
1. UPDATE user SET isActive = false
2. Query tất cả RefreshToken active của user
3. Thêm TẤT CẢ vào Redis blacklist
4. Publish event 'user:deactivated'
5. → User bị kick ra ngay lập tức dù đang online

Khi JwtAuthGuard verify token:
  → Check Redis blacklist (jti)
  → Check user.isActive (query DB hoặc cache)
  → Nếu false → 401 Unauthorized
```

### 4.6 Audit Log (Truy vết mọi thao tác Admin/Sale)

```typescript
// Mọi thao tác CUD trên dữ liệu quan trọng đều phải ghi Audit Log
@Injectable()
export class AuditService {
  async log(params: {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;       // 'Product', 'Order', 'Voucher'...
    entityId: string;
    before?: object;       // Dữ liệu cũ (cho UPDATE/DELETE)
    after?: object;        // Dữ liệu mới (cho CREATE/UPDATE)
    ipAddress?: string;
  }) {
    await this.prisma.auditLog.create({ data: params });
  }
}

// Sử dụng:
// Trước khi sửa sản phẩm → lưu snapshot cũ vào before
// Sau khi sửa → lưu data mới vào after
// Admin có thể xem "Ai đã sửa gì, lúc nào" → truy vết 100%
```

---

## 5. Secure Headers & CORS

```typescript
// main.ts
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // cho MinIO images
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://minio.yourdomain.com"],
      scriptSrc: ["'self'"],
    }
  }
}));

app.enableCors({
  origin: config.get('FRONTEND_URL'),  // CHỈ cho phép frontend domain
  credentials: true,                    // Cho phép Cookie
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## 6. Security Checklist

- [ ] JWT lưu trong HttpOnly Cookie (không localStorage)
- [ ] Access Token TTL ngắn (15m), Refresh Token rotation
- [ ] Redis blacklist cho logout / ban / password change
- [ ] Backend validate tất cả input (class-validator)
- [ ] Backend tự tính giá, KHÔNG tin frontend
- [ ] Rate limiting cho OTP, login, checkout
- [ ] Role-based guard ở MỌI endpoint (không chỉ frontend)
- [ ] Audit log cho mọi thao tác ADMIN/SALE
- [ ] Helmet + CORS configured
- [ ] Password hash bằng bcrypt (không SHA)
- [ ] Prisma ORM (tránh SQL injection)
- [ ] File upload validate: type, size, dimensions
- [ ] Không trả về sensitive fields (password, tokens) trong API response
- [ ] isActive check khi verify token
- [ ] XSS sanitize cho rich text content (product description)
