# 🛠️ Setup Môi Trường Dev — Auth Module

> **Mục tiêu**: Chạy được `backend` (NestJS :3000) + `frontend` (Vite :5173) và test connect thành công lần đầu.

---

## 📋 Checklist Tổng Quan

- [ ] Cài đặt Docker + khởi chạy Postgres & Redis
- [ ] Cấu hình `.env` cho backend (đầy đủ)
- [ ] Migrate Prisma schema và generate client
- [ ] Cấu hình `.env` cho frontend
- [ ] Lấy Google OAuth credentials
- [ ] Lấy Gmail App Password cho Nodemailer
- [ ] Chạy backend & frontend, test health check

---

## 1. 🐳 Khởi Chạy Database & Redis (Docker)

Project đã có sẵn `docker-compose.yml` ở root. Chỉ cần chạy:

```bash
# Từ thư mục root: d:\Code\Ecommerce-Shop
docker compose up -d
```

Lệnh này sẽ tạo:
| Service    | Container         | Port   | User/Pass            |
|------------|-------------------|--------|----------------------|
| PostgreSQL | `ecommerce_db`    | `5432` | `postgres/postgres`  |
| Redis      | `ecommerce_redis` | `6379` | (không cần password) |

**Kiểm tra container đã chạy:**
```bash
docker ps
```
Kết quả mong đợi: 2 container status `Up`.

---

## 2. ⚙️ Cấu Hình Backend `.env`

File `.env` hiện tại chỉ có `DATABASE_URL` mặc định từ Prisma. Cần **thay toàn bộ** nội dung:

**📄 `backend/.env` — copy và điền thông tin của bạn:**

```env
# =============================================
# DATABASE (khớp với docker-compose.yml)
# =============================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"

# =============================================
# REDIS (khớp với docker-compose.yml)
# =============================================
REDIS_HOST=localhost
REDIS_PORT=6379

# =============================================
# JWT (có thể giữ nguyên khi dev)
# =============================================
JWT_ACCESS_SECRET=dev_access_secret_change_in_prod_abc123xyz
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_prod_abc123xyz
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# =============================================
# GOOGLE OAUTH (xem hướng dẫn Section 4)
# =============================================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# =============================================
# MAIL — Gmail SMTP (xem hướng dẫn Section 5)
# =============================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=abcd efgh ijkl mnop
MAIL_FROM="EShop" <your_gmail@gmail.com>

# =============================================
# APP
# =============================================
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> **Lưu ý**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MAIL_USER`, `MAIL_PASS` cần được điền thực — xem hướng dẫn bên dưới.

---

## 3. 🗄️ Migrate Prisma Database

Sau khi Docker đang chạy và `.env` đã đúng `DATABASE_URL`:

```bash
# Trong thư mục backend
cd d:\Code\Ecommerce-Shop\backend

# Lần đầu: tạo migration và apply
npx prisma migrate dev --name init_auth

# Generate Prisma Client (bắt buộc sau migrate)
npx prisma generate
```

**Kiểm tra:**
```bash
# Mở Prisma Studio để xem DB (optional nhưng hữu ích)
npx prisma studio
```
Mở browser `http://localhost:5555` — thấy các bảng `users`, `otp_codes`, `refresh_tokens` là thành công.

---

## 4. 🔑 Lấy Google OAuth Credentials

> **Bỏ qua bước này nếu muốn test trước** — Google OAuth chỉ cần khi test tính năng login Google. Backend vẫn start bình thường nếu giá trị là placeholder.

### Các bước:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới (hoặc chọn project có sẵn)
3. Vào **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Đặt tên: `EShop Dev`
7. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
8. Click **Create** → Copy `Client ID` và `Client Secret`
9. Điền vào `.env`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   ```

> **Lưu ý OAuth Consent Screen**: Nếu chưa cấu hình, Google sẽ yêu cầu thêm **Test Users** — thêm email của bạn vào để test được.

---

## 5. 📧 Lấy Gmail App Password (Nodemailer)

> **Quan trọng**: Không dùng password email thật. Phải dùng **App Password**.

### Các bước:

1. Vào Gmail account → [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification** (bắt buộc phải bật trước)
3. Tìm **App passwords** (search trong trang security)
4. Select app: **Mail** → Select device: **Other (Custom name)** → đặt tên `EShop Dev`
5. Google tạo password dạng: `abcd efgh ijkl mnop` (16 ký tự)
6. Điền vào `.env`:
   ```env
   MAIL_USER=your_actual_gmail@gmail.com
   MAIL_PASS=abcd efgh ijkl mnop
   MAIL_FROM="EShop" <your_actual_gmail@gmail.com>
   ```

> **Muốn bỏ qua mail lúc dev?**: Có thể dùng [Ethereal Email](https://ethereal.email/) — tạo account free, nhận credentials test, email không gửi thật mà vào hộp thư ảo.

---

## 6. 🖥️ Cấu Hình Frontend `.env`

File `frontend/.env` hiện tại đã đúng:

```env
VITE_API_URL=http://localhost:3000/api
```

Không cần thay đổi gì thêm cho lần test đầu tiên.

---

## 7. 🚀 Chạy Backend & Frontend

### Terminal 1 — Backend:
```bash
cd d:\Code\Ecommerce-Shop\backend
npm run start:dev
```

**Kết quả mong đợi** (console output):
```
[NestFactory] Starting Nest application...
[InstanceLoader] AppModule dependencies initialized
[RoutesResolver] AuthController {/api/auth}
[NestApplication] Nest application successfully started on port 3000
```

### Terminal 2 — Frontend:
```bash
cd d:\Code\Ecommerce-Shop\frontend
npm run dev
```

**Kết quả mong đợi**:
```
VITE v7.x.x  ready in Xms
  ➜  Local:   http://localhost:5173/
```

---

## 8. ✅ Test Connection

### 8.1 Health Check Backend
Mở browser hoặc dùng curl:
```
GET http://localhost:3000/api
```
Kỳ vọng: `200 OK` với message từ AppController.

### 8.2 Test API Auth từ Frontend
Mở `http://localhost:5173` → tương tác với form đăng ký.

### 8.3 Dùng Postman/Thunder Client để test API trực tiếp

#### Test Register:
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!"
}
```

#### Test Login:
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}
```

---

## 9. 🔍 Debugging Thường Gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `Connection refused` port 5432 | Docker chưa chạy | `docker compose up -d` |
| `Connection refused` port 6379 | Redis chưa chạy | `docker compose up -d` |
| `Can't reach database server` | `DATABASE_URL` sai | Kiểm tra user/pass/dbname trong `.env` |
| `PrismaClientInitializationError` | Chưa chạy migrate | `npx prisma migrate dev` |
| `Invalid redirectUri` Google | Callback URL chưa đăng ký | Thêm URL vào Google Console |
| `Invalid login: 535` Gmail | Dùng sai password | Phải dùng App Password, không phải password Gmail thường |
| CORS error từ frontend | `FRONTEND_URL` sai | Kiểm tra `.env` backend: `FRONTEND_URL=http://localhost:5173` |

---

## 10. 📁 Cấu Trúc `.env` Tóm Tắt

```
Ecommerce-Shop/
├── backend/
│   └── .env          ← ✅ Cần điền đầy đủ (DB, Redis, JWT, Google, Mail)
└── frontend/
    └── .env          ← ✅ Đã OK (VITE_API_URL=http://localhost:3000/api)
```

---

## 🎯 Thứ Tự Ưu Tiên

```
1. Docker up (Postgres + Redis)          ← Bắt buộc
2. Backend .env đầy đủ                   ← Bắt buộc  
3. npx prisma migrate dev                ← Bắt buộc
4. npm run start:dev (backend)           ← Bắt buộc
5. npm run dev (frontend)               ← Bắt buộc
6. Gmail App Password                    ← Cần để test OTP/email
7. Google OAuth credentials             ← Cần để test login Google
```

> **Quick start**: Nếu chỉ muốn test register/login cơ bản mà không cần email + Google, chỉ cần hoàn thành bước 1→5 là đủ.
