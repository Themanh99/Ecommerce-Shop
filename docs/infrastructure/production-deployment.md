# Triển khai production

## Chuẩn bị

1. Copy `infra/.env.production.example` thành `infra/.env.production`.
2. Thay toàn bộ password/secret bằng giá trị ngẫu nhiên mạnh.
3. Cấu hình SMTP thực và domain public.
4. Dùng image có tag bất biến theo commit hoặc ngày phát hành.
5. Đặt TLS tại load balancer/Cloudflare hoặc bổ sung chứng chỉ trước Nginx.

Không dùng mật khẩu hoặc seed admin mặc định ở production.

## Validate

```bash
docker compose \
  --env-file infra/.env.production \
  -f infra/compose.prod.yml \
  config --quiet
```

## Deploy

```bash
chmod +x infra/scripts/prod-deploy.sh
./infra/scripts/prod-deploy.sh infra/.env.production
```

Migration là job one-shot và phải thành công trước khi backend được khởi động.
Nếu migration thất bại, traffic cũ không nên được chuyển sang phiên bản mới.

## Kiểm tra sau deploy

```bash
curl -fsS http://127.0.0.1/healthz
curl -fsS http://127.0.0.1/api/health/live
curl -fsS http://127.0.0.1/api/health/ready
docker compose --env-file infra/.env.production -f infra/compose.prod.yml ps
```

## TLS

Compose production chỉ lắng nghe HTTP để có thể đặt sau Cloudflare, AWS ALB,
Traefik hoặc reverse proxy của VPS. Không expose trực tiếp cổng này ra internet
nếu chưa có lớp TLS phía trước.
