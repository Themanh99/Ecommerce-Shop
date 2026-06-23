# Runbook vận hành

## Xem trạng thái và log

```bash
docker compose ps
docker compose logs --tail=200 backend
docker compose logs --tail=200 frontend
docker compose logs --tail=200 nginx
```

## Healthcheck

- Gateway: `/healthz`
- Backend liveness: `/api/health/live`
- Backend readiness: `/api/health/ready`

Readiness kiểm tra cả PostgreSQL và Redis. Nginx không nhận traffic khi backend
hoặc frontend chưa healthy.

## Backup PostgreSQL

```bash
./infra/scripts/backup.sh infra/.env.production backups
```

Kiểm tra restore định kỳ trên database tách biệt:

```bash
pg_restore --clean --if-exists --no-owner \
  --dbname="$DATABASE_URL" backups/moonkid-YYYYMMDDTHHMMSSZ.dump
```

## Sự cố thường gặp

### `db-migrate` thất bại

1. Xem log `db-migrate`.
2. Không chạy `prisma db push` trên production.
3. Sửa migration hoặc forward-fix bằng migration mới.
4. Chạy lại job migration rồi mới bật backend.

### Backend `not_ready`

1. Kiểm tra `postgres` và `redis` có healthy không.
2. Kiểm tra `DATABASE_URL` và `REDIS_PASSWORD`.
3. Chạy `docker compose exec backend curl -fsS localhost:3000/api/health/ready`.

### Ảnh không tải

1. Kiểm tra MinIO và `minio-init`.
2. Kiểm tra bucket tồn tại.
3. Kiểm tra đường dẫn public dạng `/storage/<bucket>/<object>`.

### Rollback

1. Đổi `BACKEND_IMAGE` và `FRONTEND_IMAGE` về tag trước.
2. Chạy lại deploy.
3. Không rollback migration phá hủy dữ liệu; ưu tiên forward-fix.
