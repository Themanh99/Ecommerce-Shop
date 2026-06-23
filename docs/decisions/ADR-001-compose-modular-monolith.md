# ADR-001: Docker Compose và modular monolith

## Status

Accepted

## Date

2026-06-23

## Context

MoonKid đang ở giai đoạn xây nền tảng trước khi phát triển các module nghiệp vụ.
Team cần một cách chạy local đồng nhất và một gói deploy nhanh lên một VPS,
trong khi vẫn đảm bảo giao dịch đơn hàng/tồn kho có tính nhất quán cao.

## Decision

Sử dụng modular monolith gồm Next.js và NestJS, được đóng gói bằng Docker.
Docker Compose điều phối Nginx, PostgreSQL, Redis, MinIO và SMTP. Local và
production dùng hai file Compose riêng, cùng Dockerfile multi-stage.

## Alternatives Considered

### Microservices

- Có khả năng deploy độc lập.
- Tăng đáng kể chi phí vận hành, tracing và xử lý transaction phân tán.
- Chưa phù hợp quy mô team và domain hiện tại.

### Kubernetes

- Tốt cho autoscaling và nhiều service.
- Quá nặng cho giai đoạn một VPS và chưa có đội platform.

### Cài service trực tiếp trên VPS

- Ít lớp trừu tượng.
- Khó tái lập, rollback và đồng nhất local/production.

## Consequences

- Một lệnh có thể chạy đầy đủ stack local.
- Migration được kiểm soát trước startup.
- Backend/frontend stateless có thể scale ngang sau này.
- PostgreSQL, Redis và MinIO vẫn cần chiến lược backup riêng.
- Khi số team hoặc tải tăng rõ rệt, có thể tách bounded context nhưng không cần
  thay đổi hợp đồng public ngay.
