# Setup môi trường dev local MoonKid

Mục tiêu của file này: khi dev hoặc fix bug, ta không chạy toàn bộ backend/frontend trong Docker. Docker chỉ chạy các service phụ trợ ổn định như database, cache, object storage và mail sandbox. Code backend/frontend chạy trực tiếp trên máy để hot reload nhanh.

## Nên dùng mode nào?

### Mode khuyến nghị khi dev hằng ngày

- Docker: PostgreSQL, Redis, MinIO, Mailpit.
- Local native: NestJS backend, Next.js frontend.
- Ưu điểm: sửa UI reload gần như tức thì, sửa backend watch compile nhanh, debug dễ bằng IDE.

### Mode full Docker

- Dùng khi cần test gần giống deploy, test Nginx reverse proxy, hoặc demo nhanh cho người khác.
- Lệnh: `docker compose up --build -d --remove-orphans`
- Nhược điểm: đổi dependency/Dockerfile phải rebuild, debug code chậm hơn.

## 1. Chuẩn bị lần đầu

Yêu cầu:

- Docker Desktop đang chạy.
- Node.js tương thích với project.
- Các port local còn trống: `3000`, `5432`, `6379`, `8025`, `8080`, `9000`, `9001`.

Từ thư mục root:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
if (-not (Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env }
```

Nếu các file `.env` đã tồn tại thì không cần copy lại, chỉ kiểm tra các giá trị chính bên dưới:

```env
# backend/.env
PORT=8080
DATABASE_URL=postgresql://moonkid:moonkid_dev_password@localhost:5432/moonkid?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=moonkid_redis_dev
MAIL_HOST=localhost
MAIL_PORT=1025
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
```

```env
# frontend/.env
API_URL=http://localhost:8080/api
# NEXT_PUBLIC_API_URL để trống nếu muốn frontend gọi /api cùng origin.
```

## 2. Chạy riêng infra bằng Docker

Nếu trước đó đang chạy full Docker stack, dừng trước để giải phóng port `3000`, `8080`, `8088`:

```powershell
docker compose stop
```

Từ root project:

```powershell
docker compose -f infra\compose.infra.yml up -d
docker compose -f infra\compose.infra.yml ps
```

Service local:

| Service | URL / host |
|---|---|
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| MinIO API | `http://localhost:9000` |
| MinIO Console | `http://localhost:9001` |
| Mailpit UI | `http://localhost:8025` |
| Mailpit SMTP | `localhost:1025` |

Thông tin mặc định:

- Postgres: `moonkid / moonkid_dev_password`, database `moonkid`
- Redis password: `moonkid_redis_dev`
- MinIO: `moonkid / moonkid_minio_dev`

## 3. Cài dependency

Mở terminal thứ hai:

```powershell
cd backend
npm install
```

Mở terminal thứ ba:

```powershell
cd frontend
npm install
```

## 4. Migrate và seed database

Chạy ở thư mục `backend`:

```powershell
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Nếu đang phát triển schema mới, dùng:

```powershell
npx prisma migrate dev --name ten_thay_doi
npx prisma db seed
```

Tài khoản admin seed mặc định:

- Email: `admin@moonkid.local`
- Password: `MoonKid@123`

## 5. Chạy backend hot reload

Ở thư mục `backend`:

```powershell
npm run start:dev
```

Kiểm tra:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/health/ready
```

Kết quả đúng là `database: true` và `redis: true`.

## 6. Chạy frontend hot reload

Ở thư mục `frontend`:

```powershell
npm run dev
```

Mở:

```text
http://localhost:3000
```

Khi sửa file trong `frontend/src`, Next.js sẽ tự reload UI. Khi sửa file trong `backend/src`, NestJS sẽ tự compile lại.

## 7. Luồng làm việc hằng ngày

Sau lần setup đầu:

```powershell
# Terminal 1: infra
docker compose -f infra\compose.infra.yml up -d

# Terminal 2: backend
cd backend
npm run start:dev

# Terminal 3: frontend
cd frontend
npm run dev
```

Khi nghỉ dev:

```powershell
docker compose -f infra\compose.infra.yml stop
```

Khi muốn xoá sạch dữ liệu local:

```powershell
docker compose -f infra\compose.infra.yml down -v
```

Cẩn thận: lệnh `down -v` xoá volume Postgres/Redis/MinIO/Mailpit local.

## 8. Khi nào dùng full Docker?

Dùng full Docker trước khi bàn giao, test deploy hoặc test Nginx:

```powershell
docker compose up --build -d --remove-orphans
docker compose ps
```

URL full Docker:

- App qua Nginx: `http://localhost:8088`
- Frontend direct: `http://localhost:3000`
- Backend API: `http://localhost:8080`

Nếu đang chạy mode infra-only, nên stop trước khi chạy full Docker để tránh lẫn state container:

```powershell
docker compose -f infra\compose.infra.yml stop
docker compose up --build -d --remove-orphans
```

## 9. Lỗi thường gặp

### Port đã bị chiếm

Kiểm tra container đang chạy:

```powershell
docker ps
```

Nếu full Docker đang chạy, dừng nó:

```powershell
docker compose stop
```

### Backend báo không kết nối được database

Kiểm tra infra:

```powershell
docker compose -f infra\compose.infra.yml ps
```

Kiểm tra `backend/.env` phải dùng host `localhost`, không phải `postgres`, vì backend đang chạy native trên máy.

### Backend báo Redis auth failed

Kiểm tra:

```env
REDIS_PASSWORD=moonkid_redis_dev
```

### Frontend gọi API lỗi

Với mode local native, backend chạy ở `localhost:8080`. Nếu cần browser gọi backend trực tiếp, bật:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Nếu không bật, frontend dùng `/api` và Next rewrite qua `API_URL`.

### Đổi package dependency

Chạy lại ở đúng thư mục:

```powershell
npm install
```

Không cần rebuild Docker nếu chỉ đang chạy infra-only.
