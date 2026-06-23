# Kiến trúc hạ tầng MoonKid

MoonKid được triển khai dưới dạng modular monolith với hai ứng dụng stateless:
Next.js storefront/admin và NestJS API. PostgreSQL giữ dữ liệu giao dịch, Redis
giữ dữ liệu tạm, MinIO giữ media và Nginx là cổng vào duy nhất.

```text
Internet / trình duyệt
          |
        Nginx :80
       /    |     \
Next.js   NestJS   MinIO public buckets
             |
        +----+-----+
        |          |
   PostgreSQL    Redis

Local only: Mailpit, MinIO console, cổng DB/Redis trực tiếp
```

## Thành phần

| Thành phần | Vai trò | Dữ liệu bền vững |
|---|---|---|
| Nginx | Reverse proxy, giới hạn request API, security headers | Không |
| Next.js | Giao diện MoonKid | Không |
| NestJS | API, auth và business logic | Không |
| PostgreSQL | Nguồn dữ liệu ACID | `postgres_data` |
| Redis | Cache, session, rate-limit và token blacklist | `redis_data` |
| MinIO | Ảnh sản phẩm, banner, avatar, ảnh đánh giá | `minio_data` |
| Mailpit | SMTP giả lập và hộp thư local | `mailpit_data` |
| db-migrate | Chạy Prisma migration trước backend | Không |
| db-seed | Seed idempotent cho local | Không |

## Ranh giới mạng

- `edge`: chỉ Nginx kết nối ra cổng host.
- `app`: Nginx, frontend và backend.
- `data`: backend, PostgreSQL, Redis và MinIO.
- Production không publish cổng database, cache hoặc object storage.

## Trình tự khởi động

1. PostgreSQL, Redis, MinIO và Mailpit đạt trạng thái healthy.
2. `minio-init` tạo các bucket.
3. `db-migrate` chạy `prisma migrate deploy`.
4. Local chạy seed idempotent.
5. Backend chỉ healthy khi PostgreSQL và Redis sẵn sàng.
6. Frontend khởi động sau backend.
7. Nginx nhận traffic sau cả frontend và backend.

## Mục tiêu vận hành ban đầu

- Availability mục tiêu: 99,5%.
- API p95 nội bộ: dưới 300 ms, không tính dịch vụ ngoài.
- RPO: tối đa 24 giờ ở giai đoạn đầu.
- RTO: tối đa 2 giờ.
- Không deploy module mới khi migration hoặc healthcheck thất bại.

## Chưa triển khai

RabbitMQ, Elasticsearch, Kubernetes và distributed tracing được hoãn đến khi
có tải hoặc nghiệp vụ thực tế chứng minh nhu cầu.
