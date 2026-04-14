# 📐 Database Schema — EShop (Thời trang)

> **Ngành nghề:** Bán quần áo thời trang (trẻ em, người lớn, nam, nữ)  
> **ORM:** Prisma + PostgreSQL  
> **Thời điểm thiết kế:** 2026-04-14  
> **Migration:** `20260414124402_full_schema_v1` — Applied ✅

## ✅ Các quyết định đã chốt

| Vấn đề | Quyết định |
|--------|------------|
| Guest checkout | ✅ Cho phép — bắt buộc nhập SĐT, email (optional), họ tên, địa chỉ giao hàng |
| Ship online | ❌ Không tích hợp — Admin xác nhận rồi tự gọi ship bên ngoài |
| Số ảnh / sản phẩm | ≤ 5 ảnh (enforce ở service layer, không phải DB constraint) |
| Review | Phải có đơn hàng đã mua mới review được; Admin duyệt trước khi hiển thị |

---

## 📋 Mục lục

1. [Tổng quan các bảng](#1-tổng-quan-các-bảng)
2. [ERD sơ đồ quan hệ](#2-erd-sơ-đồ-quan-hệ)
3. [Schema chi tiết từng bảng](#3-schema-chi-tiết-từng-bảng)
   - [AUTH & USER](#-auth--user)
   - [CATALOG — Danh mục](#-catalog--danh-mục)
   - [PRODUCT — Sản phẩm & Biến thể](#-product--sản-phẩm--biến-thể)
   - [INVENTORY — Tồn kho](#-inventory--tồn-kho)
   - [MEDIA — Hình ảnh](#-media--hình-ảnh)
   - [REVIEW — Đánh giá](#-review--đánh-giá)
   - [CART — Giỏ hàng](#-cart--giỏ-hàng)
   - [VOUCHER — Mã giảm giá](#-voucher--mã-giảm-giá)
   - [ORDER — Đơn hàng](#-order--đơn-hàng)
   - [ADDRESS — Địa chỉ giao hàng](#-address--địa-chỉ-giao-hàng)
   - [BANNER — Trang chủ](#-banner--trang-chủ)
   - [AUDIT LOG — Nhật ký](#-audit-log--nhật-ký)
4. [Giải thích thiết kế quan trọng](#4-giải-thích-thiết-kế-quan-trọng)
5. [Index & Performance](#5-index--performance)

---

## 1. Tổng quan các bảng

| # | Tên bảng | Mô tả | Nhóm |
|---|----------|-------|------|
| 1 | `User` | Tài khoản người dùng (ADMIN / SALE / USER) | Auth |
| 2 | `OtpCode` | Mã OTP tạm thời (email/phone) | Auth |
| 3 | `Category` | Danh mục sản phẩm (cây phân cấp) | Catalog |
| 4 | `Tag` | Nhãn phân loại (Nam, Nữ, Trẻ em, Sale...) | Catalog |
| 5 | `Product` | Sản phẩm gốc | Product |
| 6 | `ProductTag` | Quan hệ nhiều-nhiều Product ↔ Tag | Product |
| 7 | `OptionType` | Loại biến thể (Size, Màu sắc...) | Product |
| 8 | `OptionValue` | Giá trị biến thể (S, M, L / Đỏ, Đen...) | Product |
| 9 | `ProductVariant` | Tổ hợp biến thể cụ thể (Đỏ-M, Đen-L...) | Product |
| 10 | `VariantOption` | Quan hệ nhiều-nhiều Variant ↔ OptionValue | Product |
| 11 | `InventoryLog` | Lịch sử biến động tồn kho | Inventory |
| 12 | `ProductImage` | Hình ảnh sản phẩm (Cloudinary URL) | Media |
| 13 | `Review` | Đánh giá / Bình luận sản phẩm | Review |
| 14 | `ReviewImage` | Ảnh đính kèm review | Review |
| 15 | `Cart` | Giỏ hàng (1 User = 1 Cart) | Cart |
| 16 | `CartItem` | Dòng sản phẩm trong giỏ | Cart |
| 17 | `Voucher` | Mã giảm giá | Voucher |
| 18 | `VoucherUser` | Theo dõi voucher đã dùng | Voucher |
| 19 | `Order` | Đơn hàng | Order |
| 20 | `OrderItem` | Dòng sản phẩm trong đơn (snapshot giá) | Order |
| 21 | `OrderStatusLog` | Timeline lịch sử trạng thái đơn | Order |
| 22 | `Address` | Địa chỉ giao hàng của user | Address |
| 23 | `Banner` | Banner trang chủ | Banner |
| 24 | `AuditLog` | Lịch sử thao tác Admin/Sale | Audit |

---

## 2. ERD sơ đồ quan hệ

```mermaid
erDiagram

  %% ── AUTH ──────────────────────────────────────────────
  User {
    String  id           PK
    String  name
    String  email
    String  phone
    String  passwordHash
    String  role          "ADMIN|SALE|USER"
    String  avatar
    Boolean isActive
    Boolean isEmailVerified
    Boolean isPhoneVerified
    String  googleId
    DateTime createdAt
    DateTime updatedAt
  }

  OtpCode {
    String   id        PK
    String   contact
    String   code
    String   type      "register|login|reset"
    Boolean  used
    DateTime expiresAt
    DateTime createdAt
  }

  %% ── CATALOG ───────────────────────────────────────────
  Category {
    String  id        PK
    String  name
    String  slug
    String  parentId  FK
    String  imageUrl
    Int     sortOrder
    Boolean isActive
  }

  Tag {
    String  id   PK
    String  name "Nam|Nữ|Trẻ em|Sale|New|Trending"
    String  slug
    String  color
  }

  %% ── PRODUCT ───────────────────────────────────────────
  Product {
    String  id             PK
    String  name
    String  slug
    String  categoryId     FK
    String  description
    String  material
    String  careInstruction
    String  sizeChartUrl
    Boolean isActive
    Boolean isFeatured
    DateTime createdAt
    DateTime updatedAt
    String  createdById    FK
  }

  ProductTag {
    String productId  FK
    String tagId      FK
  }

  OptionType {
    String id        PK
    String productId FK
    String name      "Màu sắc|Size|Chất liệu"
    Int    sortOrder
  }

  OptionValue {
    String id           PK
    String optionTypeId FK
    String value        "S|M|L|XL|Đỏ|Đen"
    String displayName
    String colorHex
    Int    sortOrder
  }

  ProductVariant {
    String   id          PK
    String   productId   FK
    String   sku
    Decimal  price
    Decimal  comparePrice
    Int      stock
    Int      stockReserved
    String   barcode
    Boolean  isActive
    DateTime createdAt
    DateTime updatedAt
  }

  VariantOption {
    String variantId     FK
    String optionValueId FK
  }

  %% ── MEDIA ─────────────────────────────────────────────
  ProductImage {
    String  id        PK
    String  productId FK
    String  variantId FK "(null = ảnh chung)"
    String  url
    String  publicId  "Cloudinary ID"
    Boolean isPrimary
    Int     sortOrder
  }

  %% ── INVENTORY LOG ─────────────────────────────────────
  InventoryLog {
    String  id        PK
    String  variantId FK
    Int     delta     "+/-"
    Int     afterQty
    String  reason    "sale|return|import|adjust|reserved|released"
    String  orderId   FK "(nullable)"
    String  createdById FK
    DateTime createdAt
  }

  %% ── REVIEW ────────────────────────────────────────────
  Review {
    String  id        PK
    String  productId FK
    String  userId    FK
    String  orderId   FK "(chỉ cho phép review nếu đã mua)"
    Int     rating    "1-5"
    String  title
    String  content
    Boolean isApproved
    DateTime createdAt
  }

  ReviewImage {
    String id       PK
    String reviewId FK
    String url
  }

  %% ── CART ──────────────────────────────────────────────
  Cart {
    String id        PK
    String userId    FK "(nullable - guest cart)"
    String sessionId "(null nếu logged in)"
    DateTime updatedAt
  }

  CartItem {
    String  id        PK
    String  cartId    FK
    String  variantId FK
    Int     quantity
    DateTime addedAt
  }

  %% ── VOUCHER ───────────────────────────────────────────
  Voucher {
    String   id            PK
    String   code
    String   type          "percent|fixed"
    Decimal  value
    Decimal  minOrderValue
    Decimal  maxDiscount
    Int      usageLimit
    Int      usedCount
    Boolean  isActive
    DateTime startsAt
    DateTime expiresAt
    DateTime createdAt
  }

  VoucherUser {
    String   id        PK
    String   voucherId FK
    String   userId    FK
    String   orderId   FK
    DateTime usedAt
  }

  %% ── ORDER ─────────────────────────────────────────────
  Order {
    String  id             PK
    String  code           "DH_8X9A2C"
    String  userId         FK "(nullable - guest)"
    String  voucherId      FK
    String  addressSnapshot Json "(snapshot địa chỉ lúc đặt)"
    Decimal subtotal
    Decimal discountAmount
    Decimal shippingFee
    Decimal total
    String  paymentMethod  "cod|bank_transfer"
    String  status         "pending|confirmed|processing|shipping|done|cancelled"
    String  paymentStatus  "unpaid|paid|refunded"
    String  note
    String  cancelReason
    DateTime expiresAt     "(auto-cancel if bank_transfer not confirmed)"
    DateTime createdAt
    DateTime updatedAt
  }

  OrderItem {
    String  id          PK
    String  orderId     FK
    String  variantId   FK "(nullable - SP đã xóa)"
    String  productName "(snapshot)"
    String  variantName "(snapshot: Đỏ / Size M)"
    String  imageUrl    "(snapshot)"
    Decimal price       "(snapshot giá lúc mua)"
    Int     quantity
    Decimal subtotal
  }

  OrderStatusLog {
    String   id        PK
    String   orderId   FK
    String   status    
    String   note
    String   createdById FK
    DateTime createdAt
  }

  %% ── ADDRESS ───────────────────────────────────────────
  Address {
    String  id         PK
    String  userId     FK
    String  fullName
    String  phone
    String  province
    String  district
    String  ward
    String  street
    Boolean isDefault
    DateTime createdAt
  }

  %% ── BANNER ────────────────────────────────────────────
  Banner {
    String  id        PK
    String  title
    String  imageUrl
    String  linkUrl
    Int     sortOrder
    Boolean isActive
    DateTime startsAt
    DateTime endsAt
    DateTime createdAt
  }

  %% ── AUDIT LOG ─────────────────────────────────────────
  AuditLog {
    String  id         PK
    String  userId     FK
    String  action     "CREATE|UPDATE|DELETE"
    String  entity
    String  entityId
    Json    before
    Json    after
    String  ipAddress
    DateTime createdAt
  }

  %% ── RELATIONS ─────────────────────────────────────────
  User         ||--o{ Address         : "has"
  User         ||--o{ Order           : "places"
  User         ||--o{ Review          : "writes"
  User         ||--o{ Cart            : "has"
  User         ||--o{ VoucherUser     : "uses"
  User         ||--o{ InventoryLog    : "creates"
  User         ||--o{ Product         : "creates (admin/sale)"
  User         ||--o{ OrderStatusLog  : "updates"
  User         ||--o{ AuditLog        : "logs"

  Category     ||--o{ Category        : "parent-child"
  Category     ||--o{ Product         : "contains"

  Product      ||--o{ ProductTag      : "tagged"
  Product      ||--o{ OptionType      : "has"
  Product      ||--o{ ProductVariant  : "has"
  Product      ||--o{ ProductImage    : "has"
  Product      ||--o{ Review          : "receives"

  Tag          ||--o{ ProductTag      : "applied to"

  OptionType   ||--o{ OptionValue     : "contains"

  OptionValue  ||--o{ VariantOption   : "used in"

  ProductVariant ||--o{ VariantOption   : "composed of"
  ProductVariant ||--o{ CartItem        : "in cart"
  ProductVariant ||--o{ OrderItem       : "in order"
  ProductVariant ||--o{ InventoryLog    : "tracked"
  ProductVariant ||--o{ ProductImage    : "has image"

  Cart         ||--o{ CartItem        : "contains"

  Order        ||--o{ OrderItem       : "contains"
  Order        ||--o{ OrderStatusLog  : "has log"
  Order        ||--|| Voucher         : "uses"
  Order        ||--o{ VoucherUser     : "via"
  Order        ||--o{ InventoryLog    : "triggers"
  Order        ||--o{ Review          : "enables"

  Voucher      ||--o{ VoucherUser     : "tracked"

  Review       ||--o{ ReviewImage     : "has"
```

---

## 3. Schema chi tiết từng bảng

---

### 🔐 AUTH & USER

#### `User` — Tài khoản người dùng

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK, `cuid()` | |
| `name` | `String` | NOT NULL | Họ và tên |
| `email` | `String` | UNIQUE, nullable | Có thể null nếu đk bằng phone |
| `phone` | `String` | UNIQUE, nullable | Có thể null nếu đk bằng Google |
| `passwordHash` | `String` | nullable | null nếu chỉ dùng OTP/Google |
| `role` | `Enum` | NOT NULL, default `USER` | `ADMIN \| SALE \| USER` |
| `avatar` | `String` | nullable | URL Cloudinary |
| `googleId` | `String` | UNIQUE, nullable | ID từ Google OAuth |
| `isActive` | `Boolean` | default `true` | Admin có thể ban |
| `isEmailVerified` | `Boolean` | default `false` | |
| `isPhoneVerified` | `Boolean` | default `false` | |
| `createdAt` | `DateTime` | auto | |
| `updatedAt` | `DateTime` | auto | |

**Quan hệ:**  
- 1 User → nhiều `Order`, `Review`, `Address`, `CartItem` (qua Cart), `VoucherUser`

---

#### `OtpCode` — Mã xác thực OTP

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `contact` | `String` | NOT NULL | Phone hoặc email |
| `code` | `String` | NOT NULL | 6 chữ số |
| `type` | `Enum` | NOT NULL | `register \| login \| reset` |
| `used` | `Boolean` | default `false` | |
| `expiresAt` | `DateTime` | NOT NULL | +5 phút |
| `createdAt` | `DateTime` | auto | |

> ⚠️ Không lưu OTP trong Redis vì cần audit. Dùng DB + index TTL via cronjob cleanup.

---

### 📂 CATALOG — Danh mục

#### `Category` — Danh mục sản phẩm (cây phân cấp)

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `name` | `String` | NOT NULL | |
| `slug` | `String` | UNIQUE | URL-friendly |
| `parentId` | `String` | FK → `Category.id`, nullable | null = danh mục gốc |
| `imageUrl` | `String` | nullable | Icon/thumbnail |
| `sortOrder` | `Int` | default `0` | Thứ tự hiển thị |
| `isActive` | `Boolean` | default `true` | |
| `createdAt` | `DateTime` | auto | |

**Cây phân cấp ví dụ:**
```
Áo (root)
├── Áo Nam
│   ├── Áo thun
│   ├── Áo sơ mi
│   └── Áo khoác
├── Áo Nữ
│   ├── Áo kiểu
│   └── Áo thun
└── Áo Trẻ em

Quần (root)
├── Quần Nam
│   ├── Quần jeans
│   └── Quần short
├── Quần Nữ
└── Quần Trẻ em

Phụ kiện (root)
├── Mũ nón
├── Thắt lưng
└── Tất vớ
```

---

#### `Tag` — Nhãn phân loại

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `name` | `String` | UNIQUE | `Nam \| Nữ \| Trẻ em \| Sale \| New \| Hot \| Trending` |
| `slug` | `String` | UNIQUE | |
| `color` | `String` | nullable | Màu badge hex |

> Tags dùng để filter nhanh, khác với Category (phân cấp). Một sản phẩm có thể có nhiều Tags.

---

### 👕 PRODUCT — Sản phẩm & Biến thể

#### `Product` — Sản phẩm gốc

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `name` | `String` | NOT NULL | |
| `slug` | `String` | UNIQUE | SEO URL |
| `categoryId` | `String` | FK | |
| `description` | `String` | nullable | HTML rich text |
| `material` | `String` | nullable | "Cotton 100%", "Polyester" |
| `careInstruction` | `String` | nullable | "Giặt tay, không sấy..." |
| `sizeChartUrl` | `String` | nullable | URL bảng size |
| `isActive` | `Boolean` | default `true` | |
| `isFeatured` | `Boolean` | default `false` | Hiện ở trang chủ |
| `createdById` | `String` | FK → `User.id` | Admin/Sale tạo |
| `createdAt` | `DateTime` | auto | |
| `updatedAt` | `DateTime` | auto | |

> **Lưu ý:** Không lưu giá ở bảng Product. Giá luôn nằm ở `ProductVariant` để hỗ trợ đa biến thể.

---

#### `ProductTag` — Quan hệ nhiều-nhiều

| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `productId` | `String` | FK, PK composite |
| `tagId` | `String` | FK, PK composite |

---

#### `OptionType` — Loại tùy chọn biến thể

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `productId` | `String` | FK | |
| `name` | `String` | NOT NULL | "Màu sắc", "Kích thước" |
| `sortOrder` | `Int` | default `0` | |

---

#### `OptionValue` — Giá trị tùy chọn

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `optionTypeId` | `String` | FK | |
| `value` | `String` | NOT NULL | "S", "M", "Đỏ", "Đen" |
| `displayName` | `String` | nullable | Tên hiển thị dài hơn |
| `colorHex` | `String` | nullable | "#FF0000" cho màu sắc |
| `sortOrder` | `Int` | default `0` | |

---

#### `ProductVariant` — Tổ hợp biến thể (Quan trọng nhất)

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `productId` | `String` | FK | |
| `sku` | `String` | UNIQUE | Mã kho hàng |
| `price` | `Decimal` | NOT NULL | Giá bán hiện tại |
| `comparePrice` | `Decimal` | nullable | Giá gốc (gạch ngang) |
| `stock` | `Int` | default `0` | Tồn kho thực tế |
| `stockReserved` | `Int` | default `0` | Đang bị giữ bởi đơn Pending |
| `barcode` | `String` | nullable | |
| `isActive` | `Boolean` | default `true` | |
| `createdAt` | `DateTime` | auto | |
| `updatedAt` | `DateTime` | auto | |

**Tồn kho có thể mua = `stock - stockReserved`**

**Ví dụ một sản phẩm "Áo thun Polo":**
```
Áo thun Polo (Product)
├── Variant: Đỏ-S  → price=250k, stock=10, reserved=2
├── Variant: Đỏ-M  → price=250k, stock=5,  reserved=0
├── Variant: Đen-S  → price=260k, stock=0,  reserved=0 (hết)
└── Variant: Đen-M  → price=260k, stock=8,  reserved=1
```

---

#### `VariantOption` — Nhiều-nhiều Variant ↔ OptionValue

| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `variantId` | `String` | FK, PK composite |
| `optionValueId` | `String` | FK, PK composite |

---

### 📸 MEDIA — Hình ảnh

#### `ProductImage` — Ảnh sản phẩm

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `productId` | `String` | FK | |
| `variantId` | `String` | FK, nullable | null = ảnh dùng chung |
| `url` | `String` | NOT NULL | Cloudinary URL |
| `publicId` | `String` | NOT NULL | Dùng để xóa trên Cloudinary |
| `altText` | `String` | nullable | SEO alt text |
| `isPrimary` | `Boolean` | default `false` | Ảnh đại diện |
| `sortOrder` | `Int` | default `0` | |

---

### 📦 INVENTORY — Tồn kho

#### `InventoryLog` — Nhật ký biến động tồn kho

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `variantId` | `String` | FK | |
| `delta` | `Int` | NOT NULL | +10 (nhập), -2 (bán) |
| `afterQty` | `Int` | NOT NULL | Tồn kho sau thay đổi |
| `reason` | `Enum` | NOT NULL | `sale \| return \| import \| manual_adjust \| reserved \| released` |
| `orderId` | `String` | FK, nullable | Đơn hàng gây ra thay đổi |
| `note` | `String` | nullable | Ghi chú thủ công |
| `createdById` | `String` | FK | |
| `createdAt` | `DateTime` | auto | |

---

### ⭐ REVIEW — Đánh giá

#### `Review` — Đánh giá sản phẩm

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `productId` | `String` | FK | |
| `userId` | `String` | FK | |
| `orderId` | `String` | FK | Chỉ ai đã mua mới review được |
| `rating` | `Int` | `1-5` | |
| `title` | `String` | nullable | |
| `content` | `String` | nullable | |
| `isApproved` | `Boolean` | default `false` | Admin duyệt trước khi hiện |
| `helpfulCount` | `Int` | default `0` | Like review |
| `createdAt` | `DateTime` | auto | |

**Ràng buộc nghiệp vụ:** `UNIQUE(productId, userId, orderId)` — mỗi đơn chỉ review 1 lần.

#### `ReviewImage` — Ảnh trong review

| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `id` | `String` | PK |
| `reviewId` | `String` | FK |
| `url` | `String` | NOT NULL |

---

### 🛒 CART — Giỏ hàng

#### `Cart` — Giỏ hàng

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `userId` | `String` | FK, UNIQUE, nullable | null = guest |
| `sessionId` | `String` | UNIQUE, nullable | Guest session |
| `updatedAt` | `DateTime` | auto | |

#### `CartItem` — Dòng trong giỏ hàng

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `cartId` | `String` | FK | |
| `variantId` | `String` | FK | |
| `quantity` | `Int` | ≥ 1 | |
| `addedAt` | `DateTime` | auto | |

**Ràng buộc:** `UNIQUE(cartId, variantId)` — không trùng variant trong cùng giỏ.

---

### 🎫 VOUCHER — Mã giảm giá

#### `Voucher` — Voucher / Mã giảm giá

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `code` | `String` | UNIQUE | "SUMMER20", "VUI50" |
| `type` | `Enum` | NOT NULL | `percent \| fixed` |
| `value` | `Decimal` | NOT NULL | 20 (%) hoặc 50000 (VND) |
| `minOrderValue` | `Decimal` | default `0` | Đơn tối thiểu để áp dụng |
| `maxDiscount` | `Decimal` | nullable | Trần giảm tối đa (cho percent) |
| `usageLimit` | `Int` | nullable | null = không giới hạn |
| `perUserLimit` | `Int` | default `1` | Mỗi user dùng tối đa N lần |
| `usedCount` | `Int` | default `0` | Tổng đã dùng |
| `isActive` | `Boolean` | default `true` | |
| `isPublic` | `Boolean` | default `false` | Hiện trên storefront không |
| `startsAt` | `DateTime` | nullable | |
| `expiresAt` | `DateTime` | nullable | |
| `createdById` | `String` | FK | |
| `createdAt` | `DateTime` | auto | |

#### `VoucherUser` — Theo dõi ai đã dùng voucher nào

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `voucherId` | `String` | FK | |
| `userId` | `String` | FK | |
| `orderId` | `String` | FK, UNIQUE | 1 đơn = 1 voucher |
| `discountAmount` | `Decimal` | NOT NULL | Số tiền thực giảm |
| `usedAt` | `DateTime` | auto | |

---

### 🧾 ORDER — Đơn hàng

#### `Order` — Đơn hàng chính

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `code` | `String` | UNIQUE | `DH_8X9A2C` — ngắn, dễ đọc |
| `userId` | `String` | FK, nullable | null = guest |
| `voucherId` | `String` | FK, nullable | |
| `addressSnapshot` | `Json` | NOT NULL | Snapshot địa chỉ lúc đặt |
| `subtotal` | `Decimal` | NOT NULL | Trước giảm |
| `discountAmount` | `Decimal` | default `0` | Số tiền giảm |
| `shippingFee` | `Decimal` | default `0` | |
| `total` | `Decimal` | NOT NULL | Tổng thanh toán thực |
| `paymentMethod` | `Enum` | NOT NULL | `cod \| bank_transfer` |
| `paymentStatus` | `Enum` | default `unpaid` | `unpaid \| paid \| refunded` |
| `status` | `Enum` | default `pending` | Xem bên dưới |
| `note` | `String` | nullable | Ghi chú của khách |
| `cancelReason` | `String` | nullable | Lý do hủy |
| `expiresAt` | `DateTime` | nullable | Auto-cancel nếu CK quá hạn |
| `confirmedAt` | `DateTime` | nullable | |
| `shippedAt` | `DateTime` | nullable | |
| `completedAt` | `DateTime` | nullable | |
| `cancelledAt` | `DateTime` | nullable | |
| `createdAt` | `DateTime` | auto | |
| `updatedAt` | `DateTime` | auto | |

**Trạng thái đơn hàng (Order Status):**

```
pending → confirmed → processing → shipping → done
                                          ↘ cancelled (từ bất kỳ bước nào)
```

| Status | Mô tả |
|--------|-------|
| `pending` | Vừa đặt, chờ xác nhận |
| `confirmed` | Sale đã xác nhận (COD: gọi điện / CK: đã thấy tiền) |
| `processing` | Đang chuẩn bị / đóng gói hàng |
| `shipping` | Đang giao hàng |
| `done` | Khách đã nhận hàng |
| `cancelled` | Đã hủy (hết hạn / admin hủy / khách hủy) |

**`addressSnapshot` (JSON structure):**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "street": "123 Nguyễn Huệ"
}
```

> ⚠️ **QUAN TRỌNG:** Lưu snapshot địa chỉ vào JSON, KHÔNG FK sang bảng Address. Nếu khách sau này sửa địa chỉ thì đơn cũ vẫn giữ đúng địa chỉ giao hàng gốc.

---

#### `OrderItem` — Dòng sản phẩm trong đơn (Snapshot)

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `orderId` | `String` | FK | |
| `variantId` | `String` | FK, nullable | null nếu variant đã bị xóa |
| `productName` | `String` | NOT NULL | **Snapshot** — lưu tên SP |
| `variantName` | `String` | NOT NULL | **Snapshot** — "Đỏ / Size M" |
| `imageUrl` | `String` | nullable | **Snapshot** — URL ảnh |
| `sku` | `String` | nullable | Snapshot sku |
| `price` | `Decimal` | NOT NULL | **Snapshot** giá lúc mua |
| `quantity` | `Int` | NOT NULL | |
| `subtotal` | `Decimal` | NOT NULL | `price × quantity` |

> ⚠️ **Snapshot pattern:** Tất cả thông tin sản phẩm phải được copy vào OrderItem. Nếu sau này Admin sửa tên/giá sản phẩm thì lịch sử đơn hàng cũ vẫn hiển thị đúng.

---

#### `OrderStatusLog` — Timeline lịch sử đơn hàng

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `orderId` | `String` | FK | |
| `fromStatus` | `String` | nullable | |
| `toStatus` | `String` | NOT NULL | |
| `note` | `String` | nullable | "Đã xác nhận chuyển khoản" |
| `createdById` | `String` | FK | User/Admin thực hiện |
| `createdAt` | `DateTime` | auto | |

---

### 📍 ADDRESS — Địa chỉ giao hàng

#### `Address` — Sổ địa chỉ người dùng

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `userId` | `String` | FK | |
| `fullName` | `String` | NOT NULL | |
| `phone` | `String` | NOT NULL | |
| `province` | `String` | NOT NULL | |
| `district` | `String` | NOT NULL | |
| `ward` | `String` | NOT NULL | |
| `street` | `String` | NOT NULL | Số nhà, tên đường |
| `isDefault` | `Boolean` | default `false` | |
| `createdAt` | `DateTime` | auto | |

---

### 🖼️ BANNER — Trang chủ

#### `Banner` — Ảnh banner slider

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `title` | `String` | NOT NULL | |
| `imageUrl` | `String` | NOT NULL | |
| `linkUrl` | `String` | nullable | URL click banner |
| `sortOrder` | `Int` | default `0` | |
| `isActive` | `Boolean` | default `true` | |
| `startsAt` | `DateTime` | nullable | Lên lịch tự động |
| `endsAt` | `DateTime` | nullable | |
| `createdAt` | `DateTime` | auto | |

---

### 📋 AUDIT LOG — Nhật ký

#### `AuditLog` — Lịch sử thao tác Admin/Sale

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `id` | `String` | PK | |
| `userId` | `String` | FK | Ai thực hiện |
| `action` | `Enum` | NOT NULL | `CREATE \| UPDATE \| DELETE` |
| `entity` | `String` | NOT NULL | "Product", "Order", "Voucher"... |
| `entityId` | `String` | NOT NULL | ID của bản ghi bị tác động |
| `before` | `Json` | nullable | Dữ liệu trước khi thay đổi |
| `after` | `Json` | nullable | Dữ liệu sau khi thay đổi |
| `ipAddress` | `String` | nullable | |
| `createdAt` | `DateTime` | auto | |

---

## 4. Giải thích thiết kế quan trọng

### 4.1 Tại sao dùng `stock` + `stockReserved` thay vì 1 trường?

```
stockAvailable = stock - stockReserved
```

- `stock`: Tổng số lượng vật lý trong kho
- `stockReserved`: Số đang bị giữ bởi đơn `pending`
- Khi đơn `confirmed` → trừ `stock`, giảm `stockReserved`
- Khi đơn `cancelled` → chỉ giảm `stockReserved` (hàng trả về kho)

### 4.2 Tại sao OrderItem dùng Snapshot?

Nếu Admin đổi giá sản phẩm sau khi đơn đã đặt → Nếu dùng FK thì lịch sử đơn cũ bị sai giá. Snapshot đảm bảo tính toàn vẹn của dữ liệu lịch sử.

### 4.3 Guest Checkout — Không cần đăng nhập

Khi đặt hàng không có tài khoản:
- `userId = null` trong bảng Order
- Bắt buộc: `customerName`, `customerPhone`, địa chỉ giao hàng
- Tùy chọn: `customerEmail` (dùng để gửi mail xác nhận)
- Thông tin luôn được lưu dạng **flat fields** trong Order (không phụ thuộc FK)
- Admin vẫn xác nhận bình thường qua số điện thoại

### 4.4 Phân quyền theo Role

| Quyền | ADMIN | SALE | USER |
|-------|-------|------|------|
| Xem Dashboard doanh thu | ✅ | ❌ | ❌ |
| Tạo/Sửa/Xóa sản phẩm | ✅ | ✅ | ❌ |
| Xử lý đơn hàng | ✅ | ✅ | ❌ |
| Tạo/Ban tài khoản Sale | ✅ | ❌ | ❌ |
| Quản lý voucher | ✅ | ❌ | ❌ |
| Xem đơn hàng của mình | ✅ | ✅ | ✅ |
| Mua hàng, review | ❌ | ❌ | ✅ |

### 4.4 Cây Category và Tag — Khi nào dùng cái nào?

| | Category | Tag |
|-|----------|-----|
| Mục đích | Phân cấp chính (breadcrumb) | Label ngang (filter nhanh) |
| Ví dụ | Áo Nam → Áo thun | Nam, Sale, New |
| Quan hệ | 1 SP thuộc 1 Category | 1 SP có nhiều Tags |
| Phân cấp | Có (parent-child) | Không |

### 4.5 Auto-cancel via Cronjob (NestJS Scheduler)

```
Mỗi 30 phút chạy 1 lần:
SELECT * FROM Order
WHERE status = 'pending'
  AND paymentMethod = 'bank_transfer'
  AND expiresAt < NOW()

→ UPDATE status = 'cancelled'
→ Giảm stockReserved
→ Gửi email thông báo hủy
→ Tạo OrderStatusLog
```

---

## 5. Index & Performance

```sql
-- User lookups
CREATE UNIQUE INDEX idx_user_email ON "User"(email);
CREATE UNIQUE INDEX idx_user_phone ON "User"(phone);
CREATE UNIQUE INDEX idx_user_google ON "User"("googleId");

-- Product search
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_active    ON "Product"("isActive");
CREATE INDEX idx_product_featured  ON "Product"("isFeatured");
CREATE UNIQUE INDEX idx_product_slug ON "Product"(slug);

-- Category
CREATE UNIQUE INDEX idx_category_slug ON "Category"(slug);
CREATE INDEX idx_category_parent ON "Category"("parentId");

-- Variant
CREATE UNIQUE INDEX idx_variant_sku ON "ProductVariant"(sku);
CREATE INDEX idx_variant_product ON "ProductVariant"("productId");

-- Order
CREATE UNIQUE INDEX idx_order_code ON "Order"(code);
CREATE INDEX idx_order_user   ON "Order"("userId");
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_order_created ON "Order"("createdAt");

-- Cart
CREATE UNIQUE INDEX idx_cart_user    ON "Cart"("userId");
CREATE UNIQUE INDEX idx_cart_session ON "Cart"("sessionId");
CREATE UNIQUE INDEX idx_cartitem_uniq ON "CartItem"("cartId", "variantId");

-- Voucher
CREATE UNIQUE INDEX idx_voucher_code ON "Voucher"(code);

-- OTP cleanup
CREATE INDEX idx_otp_contact_type ON "OtpCode"(contact, type);
CREATE INDEX idx_otp_expires ON "OtpCode"("expiresAt");

-- Inventory
CREATE INDEX idx_inventory_variant ON "InventoryLog"("variantId");
CREATE INDEX idx_inventory_created ON "InventoryLog"("createdAt");

-- Audit
CREATE INDEX idx_audit_entity ON "AuditLog"(entity, "entityId");
CREATE INDEX idx_audit_user   ON "AuditLog"("userId");
```

---

## ⚡ Tóm tắt nhanh

```
24 bảng tổng cộng
├── 2  bảng Auth (User, OtpCode)
├── 2  bảng Catalog (Category, Tag)
├── 6  bảng Product (Product, ProductTag, OptionType, OptionValue, ProductVariant, VariantOption)
├── 2  bảng Media (ProductImage, ReviewImage)
├── 1  bảng Inventory (InventoryLog)
├── 2  bảng Review (Review, ReviewImage)
├── 2  bảng Cart (Cart, CartItem)
├── 2  bảng Voucher (Voucher, VoucherUser)
├── 3  bảng Order (Order, OrderItem, OrderStatusLog)
├── 1  bảng Address
├── 1  bảng Banner
└── 1  bảng AuditLog
```
