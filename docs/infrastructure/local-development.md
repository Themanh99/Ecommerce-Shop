# Chạy local bằng Docker

## Yêu cầu

- Docker Desktop hỗ trợ Docker Compose.
- Các cổng mặc định còn trống: `3000`, `5432`, `6379`, `8025`, `8080`,
  `8088`, `9000`, `9001`.

## Khởi động

```powershell
Copy-Item .env.example .env
.\infra\scripts\dev-up.ps1
```

Hoặc:

```powershell
docker compose up --build -d
docker compose ps
```

## Địa chỉ dịch vụ

| Dịch vụ | URL |
|---|---|
| MoonKid qua Nginx | http://localhost:8088 |
| Frontend trực tiếp | http://localhost:3000 |
| Backend health | http://localhost:8080/api/health/ready |
| Mailpit | http://localhost:8025 |
| MinIO console | http://localhost:9001 |

Thông tin đăng nhập MinIO và admin seed nằm trong `.env`. Các giá trị mặc định
chỉ dành cho máy local.

## Hot reload

`frontend/src`, `frontend/public`, `backend/src`, `backend/prisma` và
`backend/test` được bind mount. Thay đổi mã nguồn sẽ được phản ánh mà không cần
rebuild image. Khi thay đổi dependency hoặc Dockerfile, chạy lại:

```powershell
docker compose up --build -d
```

## Công cụ database tùy chọn

```powershell
docker compose --profile tools up -d adminer
```

Adminer chạy tại http://localhost:8081, server là `postgres`.

## Reset dữ liệu local

Lệnh sau xóa toàn bộ volume local của project MoonKid:

```powershell
.\infra\scripts\dev-reset.ps1
```
