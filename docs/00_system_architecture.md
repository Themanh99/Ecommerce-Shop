# 🏗️ Kiến trúc Hệ thống — BabyShop (Quần áo Trẻ em)

> **Phiên bản:** v2.0 — Redesign  
> **Ngày cập nhật:** 2026-06-23  
> **Kiến trúc:** Monolith — tối ưu cho lượng user nhỏ, chi phí thấp, ship nhanh

---

## 1. Tổng quan Kiến trúc

### 1.1 Lý do chọn Monolith

| Tiêu chí | Đánh giá |
|-----------|----------|
| Lượng user | Nhỏ (< 1000 concurrent) |
| Team size | 1-2 dev |
| Chi phí vận hành | Cực thấp (1 VPS hoặc free tier) |
| Tốc độ phát triển | Nhanh — không cần setup IPC, service mesh |
| Khả năng scale sau | Tốt — module rõ ràng, có thể tách microservice khi cần |

### 1.2 Sơ đồ Tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │   Nginx     │  ← Reverse Proxy + SSL + Static
                     │  (hoặc LB)  │     (Let's Encrypt / Cloudflare)
                     └──┬───────┬──┘
                        │       │
            ┌───────────▼─┐   ┌─▼────────────┐
            │  Frontend   │   │   Backend     │
            │  React+Vite │   │   NestJS      │
            │  :5173/80   │   │   :3000       │
            │  (SPA)      │   │   (REST API)  │
            └─────────────┘   └──┬──┬──┬──┬───┘
                                 │  │  │  │
                  ┌──────────────┘  │  │  └──────────────┐
                  │                 │  │                  │
           ┌──────▼──────┐  ┌──────▼──┐  ┌──────▼─────┐  ┌▼──────────┐
           │ PostgreSQL  │  │  Redis  │  │   MinIO    │  │ Nodemailer│
           │   :5432     │  │  :6379  │  │ :9000/:9001│  │  (SMTP)   │
           │             │  │         │  │            │  │           │
           │ • Users     │  │ • Cache │  │ • Product  │  │ • OTP     │
           │ • Products  │  │ • Pub/S │  │   Images   │  │ • Confirm │
           │ • Orders    │  │ • Token │  │ • Banners  │  │ • Status  │
           │ • Inventory │  │   Black │  │ • Reviews  │  │   Update  │
           │ • AuditLog  │  │ • Stock │  │ • Avatars  │  │           │
           └─────────────┘  │   Calc  │  │ • Excel    │  └───────────┘
                            └─────────┘  │   Import   │
                                         └────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     MONITORING (Optional)                        │
│  Prometheus :9090  →  Grafana :3001  →  Alertmanager (optional) │
│  cAdvisor  :8080  →  node-exporter :9100                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Tech Stack

| Layer | Công nghệ | Vai trò |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite + TypeScript | SPA, 2 layout (Storefront + Admin) |
| **Styling** | Tailwind CSS + Ant Design 5 | UI Kit chuyên nghiệp |
| **State** | Zustand + TanStack Query | State client + server cache |
| **Backend** | NestJS 11 + TypeScript | REST API, business logic |
| **ORM** | Prisma 7 | Type-safe DB access |
| **Database** | PostgreSQL 16 | Relational data, ACID |
| **Cache/PubSub** | Redis 7 (ioredis) | Cache, Pub/Sub, token blacklist, stock calc |
| **Object Storage** | MinIO | Self-hosted S3-compatible (ảnh, file) |
| **Email** | Nodemailer + Gmail SMTP | OTP, order confirmation |
| **Auth** | JWT (HttpOnly Cookie) + OAuth2 Google | Stateless auth |
| **Container** | Docker + Docker Compose | Tất cả services |
| **Proxy** | Nginx | Reverse proxy, SSL, static files |
| **Monitoring** | Prometheus + Grafana + cAdvisor | Metrics, alerting |

---

## 2. Chi tiết từng Service

### 2.1 PostgreSQL — Cơ sở dữ liệu chính

**Vai trò:** Nguồn sự thật duy nhất (Single Source of Truth) cho toàn bộ business data.

**24 bảng** chia thành các nhóm:
- **Auth:** User, OtpCode, RefreshToken
- **Catalog:** Category (cây phân cấp), Tag
- **Product:** Product, ProductTag, OptionType, OptionValue, ProductVariant, VariantOption
- **Media:** ProductImage, ReviewImage
- **Inventory:** InventoryLog
- **Cart:** Cart, CartItem
- **Order:** Order, OrderItem, OrderStatusLog
- **Voucher:** Voucher, VoucherUser
- **Review:** Review, ReviewImage
- **Misc:** Address, Banner, AuditLog

> Schema chi tiết: xem `06_database_schema.md`

---

### 2.2 Redis — Cache, Pub/Sub & Inventory Engine

Redis phục vụ **3 chức năng chính** trong hệ thống:

#### A. Cache Layer (Read-through / Write-through)

| Key Pattern | TTL | Mô tả |
|-------------|-----|-------|
| `cache:product:{slug}` | 30 phút | Chi tiết sản phẩm (tránh query nặng JOIN 5 bảng) |
| `cache:products:list:{hash}` | 10 phút | Kết quả tìm kiếm/filter sản phẩm (key = hash của query params) |
| `cache:categories:tree` | 1 giờ | Cây danh mục (ít thay đổi) |
| `cache:home:featured` | 15 phút | Sản phẩm nổi bật trang chủ |
| `cache:home:banners` | 30 phút | Banners active |
| `cache:voucher:{code}` | 5 phút | Thông tin voucher |
| `cache:dashboard:stats:{date}` | 5 phút | Thống kê dashboard (chỉ admin) |

**Cache Invalidation Strategy:**
- Khi Admin CRUD sản phẩm → xóa `cache:product:{slug}` + `cache:products:list:*`
- Khi đơn hàng thay đổi trạng thái → xóa `cache:dashboard:stats:*`
- Khi Admin sửa banner/category → xóa key tương ứng
- Dùng **pattern delete** (`SCAN` + `DEL`) cho wildcard keys

#### B. Pub/Sub — Event-driven trong Monolith

Thay vì dùng RabbitMQ (overkill cho monolith nhỏ), Redis Pub/Sub xử lý event nội bộ:

| Channel | Publisher | Subscriber | Mô tả |
|---------|-----------|------------|-------|
| `order:created` | OrderService | NotificationService, InventoryService | Đơn mới → gửi email + lock stock |
| `order:confirmed` | OrderService | NotificationService, InventoryService | Xác nhận → deduct stock thật |
| `order:cancelled` | OrderService / CronJob | InventoryService, NotificationService | Hủy → release stock + email |
| `order:status_changed` | OrderService | NotificationService | Giao/Done → email tracking |
| `product:updated` | ProductService | CacheService | Invalidate cache |
| `user:deactivated` | UserService | AuthService (blacklist tokens) | Ban user → kick ra ngay |

**Tại sao Redis Pub/Sub thay vì NestJS EventEmitter?**
- EventEmitter là sync trong cùng process → block thread
- Redis Pub/Sub là async, không block
- Sau này tách service vẫn hoạt động (cross-process communication)
- Tuy nhiên Redis Pub/Sub **không persist message** (fire-and-forget) — chấp nhận được cho monolith vì tất cả subscriber cùng process

#### C. Inventory (Tồn kho) — Redis-assisted Calculation

**Bài toán:** Khi 2 khách đặt hàng cùng lúc, cùng variant chỉ còn 1 chiếc → **race condition**.

**Giải pháp:** Dùng Redis `DECRBY` (atomic operation) để tính toán stock real-time:

```
Key:   stock:available:{variantId}
Value: integer (stockAvailable = stock - stockReserved)
```

**Luồng đặt hàng:**
1. Client gửi `POST /api/orders`
2. Backend dùng Redis `DECRBY stock:available:{variantId} {quantity}`
   - Nếu kết quả ≥ 0 → OK, tiếp tục tạo order
   - Nếu kết quả < 0 → `INCRBY` lại, trả lỗi "Hết hàng"
3. Ghi vào PostgreSQL: update `stockReserved`, tạo `InventoryLog`
4. Publish event `order:created`

**Sync Redis ↔ DB:**
- Khi server khởi động → load tất cả `stock - stockReserved` vào Redis
- Cronjob mỗi 5 phút → so sánh Redis vs DB, fix drift nếu có
- Khi Admin nhập hàng (import stock) → update cả DB + Redis

#### D. Token Blacklist

```
Key:   blacklist:{jti}    (jti = JWT ID)
TTL:   = thời gian còn lại của refresh token
Value: "1"
```

Dùng để:
- Logout: thêm refresh token vào blacklist
- Ban user: thêm tất cả tokens của user vào blacklist
- Detect token theft: thêm token cũ vào blacklist khi dùng rotation

---

### 2.3 MinIO — Object Storage (Self-hosted S3)

**Tại sao MinIO thay vì Cloudinary?**

| Tiêu chí | Cloudinary | MinIO |
|----------|------------|-------|
| Chi phí | Free 25GB, trả phí sau | Free vĩnh viễn (self-hosted) |
| Kiểm soát | Phụ thuộc 3rd party | Tự quản lý hoàn toàn |
| Tốc độ VN | CDN global nhưng latency có thể cao | Cùng server/VPS → ultra fast |
| S3 Compatible | Không | Có — migrate sang AWS S3 dễ dàng |
| Resize/Transform | Có (URL params) | Cần tự code (sharp.js) |

**Cấu trúc Bucket:**

```
minio/
├── products/              ← Ảnh sản phẩm (tối đa 5/SP)
│   ├── {productId}/
│   │   ├── primary.webp
│   │   ├── 1.webp
│   │   ├── 2.webp
│   │   └── thumb-primary.webp   ← Thumbnail auto-generated
│   └── ...
├── banners/               ← Ảnh banner trang chủ
│   ├── banner-{id}.webp
│   └── ...
├── reviews/               ← Ảnh review từ khách
│   ├── {reviewId}/
│   │   ├── 1.webp
│   │   └── 2.webp
│   └── ...
├── avatars/               ← Ảnh đại diện user
│   └── {userId}.webp
├── imports/               ← File Excel import tạm
│   └── {timestamp}-{filename}.xlsx
└── size-charts/           ← Bảng size sản phẩm
    └── {productId}-size-chart.webp
```

**Upload Flow:**
1. Frontend chọn file → gửi `POST /api/upload` (multipart/form-data)
2. Backend validate (type, size ≤ 5MB, dimensions)
3. Dùng `sharp` resize + convert to WebP
4. Upload lên MinIO bucket tương ứng
5. Tạo thumbnail (300x300) tự động
6. Trả về URL: `http://minio:9000/products/{productId}/primary.webp`

**Config:**
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_PRODUCTS=products
MINIO_BUCKET_BANNERS=banners
MINIO_BUCKET_REVIEWS=reviews
MINIO_BUCKET_AVATARS=avatars
MINIO_USE_SSL=false
```

---

### 2.4 Nginx — Reverse Proxy & Static Server

```nginx
# Simplified config
upstream backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name babykid.vn;

    # Frontend SPA (build output)
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MinIO static files (ảnh sản phẩm)
    location /storage/ {
        proxy_pass http://localhost:9000/;
        proxy_set_header Host $host;
        # Cache ảnh 30 ngày trên browser
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}
```

---

### 2.5 Monitoring Stack (Optional nhưng khuyến nghị)

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports: ["3001:3000"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports: ["8080:8080"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

  node-exporter:
    image: prom/node-exporter:latest
    ports: ["9100:9100"]
```

**Metrics quan trọng cần monitor:**

| Metric | Nguồn | Alert threshold |
|--------|-------|-----------------|
| CPU usage | cAdvisor | > 80% trong 5 phút |
| Memory usage | cAdvisor | > 85% |
| Disk usage | node-exporter | > 90% |
| API response time p95 | NestJS custom metric | > 2 giây |
| Order count / hour | NestJS custom metric | < 0 trong 24h (cảnh báo site down?) |
| PostgreSQL connections | pg_stat | > 80% max_connections |
| Redis memory | Redis INFO | > 80% maxmemory |
| MinIO disk | MinIO metrics | > 80% capacity |
| Error rate (5xx) | Nginx logs | > 1% requests |

**NestJS metrics endpoint:**
Thêm module `@willsoto/nestjs-prometheus` hoặc custom `/api/metrics` để expose Prometheus format.

---

## 3. Docker Compose — Full Stack

```yaml
# docker-compose.yml (Production-ready)
services:
  # ─── DATABASE ──────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: eshop_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ecommerce_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── CACHE / PUBSUB / INVENTORY ────────────
  redis:
    image: redis:7-alpine
    container_name: eshop_redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: >
      redis-server
      --save 60 1000
      --loglevel warning
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── OBJECT STORAGE ────────────────────────
  minio:
    image: minio/minio:latest
    container_name: eshop_minio
    restart: unless-stopped
    ports:
      - '9000:9000'   # API
      - '9001:9001'   # Web Console
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 4. Đánh giá & Khuyến nghị

### 4.1 Ưu điểm kiến trúc hiện tại

✅ **Monolith phù hợp** — lượng user nhỏ, 1-2 dev, không cần overhead của microservices  
✅ **PostgreSQL** — ACID compliance tốt cho e-commerce (tránh mất tiền, sai tồn kho)  
✅ **Redis multi-purpose** — tiết kiệm resource, 1 service phục vụ 4 mục đích  
✅ **MinIO self-hosted** — không phụ thuộc 3rd party, chi phí 0đ, S3-compatible  
✅ **Docker** — dễ deploy, consistent across environments  
✅ **Schema Prisma 600+ dòng** — đã thiết kế rất chi tiết, có snapshot pattern  

### 4.2 Rủi ro & Giải pháp

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| MinIO disk full | MEDIUM | Monitor disk usage, setup alerts, auto-compress images |
| Redis data loss khi restart | LOW | Đã config `save 60 1000` (RDB persistence) |
| Single point of failure | MEDIUM | Backup daily: pg_dump + minio mc mirror |
| No CDN cho ảnh | LOW | Nginx cache-control header + Cloudflare nếu cần |
| Race condition stock | HIGH | Redis atomic `DECRBY` đã giải quyết |
| JWT token leak | MEDIUM | HttpOnly Cookie + Blacklist Redis + short-lived access token |

### 4.3 Upgrade path (Khi scale)

```
Hiện tại (Phase 1):          Tương lai (Phase 2+):
┌────────────────┐            ┌────────────────────┐
│  1 VPS         │            │  Load Balancer     │
│  All services  │    ──►     │  ├── VPS 1 (App)   │
│  in Docker     │            │  ├── VPS 2 (App)   │
│                │            │  ├── Managed DB     │
│                │            │  ├── Managed Redis  │
│                │            │  └── CDN (images)   │
└────────────────┘            └────────────────────┘

MinIO → AWS S3 (chỉ đổi env, code S3-compatible)
Redis local → Upstash / ElastiCache
PostgreSQL → Neon / RDS
```
