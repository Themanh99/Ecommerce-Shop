# MoonKid Frontend

Frontend của MoonKid được xây dựng bằng Next.js 16 và React 19.
và App Router.

## Yêu cầu

- Node.js 20.9 trở lên
- Backend NestJS chạy tại `http://localhost:8080`

## Chạy local

```bash
copy .env.example .env.local
npm ci
npm run dev
```

Mở `http://localhost:3000`.

Next.js nhận request `/api/*` và proxy sang backend thông qua biến `API_URL`.
Nhờ vậy cookie đăng nhập tiếp tục hoạt động theo same-origin trong trình duyệt.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Cấu trúc chính

- `src/app`: routes và layouts của App Router
- `src/app/providers.tsx`: Ant Design, React Query và khởi tạo auth phía client
- `src/features`: mã theo tính năng
- `src/components`: component dùng chung
- `src/lib`: API client và tiện ích hạ tầng
- `src/stores`: Zustand stores
