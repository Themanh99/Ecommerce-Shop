# KẾ HOẠCH THIẾT KẾ VÀ PHÁT TRIỂN ỨNG DỤNG WEB E-COMMERCE

Chào bạn, dưới đây là bản kế hoạch chi tiết cho dự án Web bán hàng động (Dynamic E-commerce), tập trung vào tính bảo mật, dễ mở rộng và loại bỏ rủi ro mất tiền từ thanh toán online.

## 1. Lựa chọn Công nghệ (Tech Stack)

Vì bạn muốn sử dụng 100% TypeScript, tôi đề xuất stack sau:

* **Frontend:** ReactJS + TypeScript + Vite.
  * *Styling:* Tailwind CSS.
  * *State Management:* Zustand hoặc Redux Toolkit.
  * *Data Fetching:* TanStack Query (React Query).
  * *UI Components:* Ant Design (Đầu tư giao diện đẹp, chỉn chu, mang lại trải nghiệm UX/UI cực kỳ chuyên nghiệp).
* **Backend:** NestJS + TypeScript.
  * *Lý do:* NestJS có kiến trúc rất chặt chẽ, hỗ trợ OOP, DI và TypeScript out-of-the-box. Nó rất phù hợp cho ứng dụng quy mô từ vừa đến lớn, code gọn chuyên nghiệp, chia module rõ ràng.
  * *Database:* PostgreSQL (Cơ sở dữ liệu quan hệ, cực kỳ phù hợp cho e-commerce để đảm bảo toàn vẹn dữ liệu).
  * *ORM:* Prisma ORM (Type-safe, code ít lỗi và truy vấn siêu nhanh) hoặc TypeORM.
* **DevOps & Deploy:**
  * *Containerization:* Docker & Docker Compose.
  * *CI/CD:* GitHub Actions (Tự động build và deploy).
  * *Server:* VPS (DigitalOcean, Vultr, hoặc AWS EC2 tùy theo ngân sách).
  * *Web Server / Reverse Proxy:* Nginx + Let's Encrypt (SSL miễn phí).

## 2. Đề xuất Các tính năng cốt lõi

Để dữ liệu linh động (không fix cứng là quần áo), CSDL cần thiết kế theo hướng có thể mở rộng thuộc tính (ví dụ: dùng JSONB trong PostgreSQL để lưu các thuộc tính động theo danh mục).

### A. Dành cho Khách hàng (Storefront)
1. **Trang chủ:** Banner khuyến mãi, Sản phẩm nổi bật, Danh mục nổi bật.
2. **Sản phẩm & Danh mục:** Xem danh sách, Lọc & Tìm kiếm động (khoảng giá, số sao đánh giá, và các thuộc tính tùy chọn).
3. **Chi tiết sản phẩm:** 
   * Chọn biến thể (Size, Màu sắc -> giá và số lượng tồn kho thay đổi theo tùy chọn).
   * Đánh giá/Bình luận từ người mua.
4. **Giỏ hàng (Cart):** Quản lý sản phẩm cần mua, tính toán tổng tiền, áp dụng mã giảm giá.
5. **Thanh toán (Checkout) - *Offline / Không rủi ro*:**
   * Chỉ có 2 options thanh toán: (1) Thanh toán khi nhận hàng (COD), (2) Chuyển khoản ngân hàng thủ công (Hiển thị mã QR, Số TK, yêu cầu khách ghi chú mã đơn hàng).
6. **Tài khoản:** 
   * Đăng ký/Đăng nhập cực kỳ đơn giản qua Số điện thoại hoặc Email (Hệ thống gửi mã xác nhận OTP/Link để xác thực, không bắt buộc nhớ mật khẩu phức tạp).
   * Hỗ trợ tính năng "Quên mật khẩu" dễ dàng nếu khách hàng sử dụng mật khẩu.
   * Xem lịch sử, theo dõi trạng thái đơn hàng.

### B. Dành cho Quản trị viên (Admin Panel)
1. **Dashboard:** Thống kê doanh thu, số lượng đơn hàng.
2. **Quản lý Danh mục & Thuộc tính:** Tạo danh mục và cấu hình các trường thuộc tính động cho từng danh mục.
3. **Quản lý Sản phẩm:** CRUD sản phẩm, thêm ảnh, quản lý các biến thể (variants), quản lý tồn kho. **Hỗ trợ Import sản phẩm hàng loạt qua file Excel/CSV**.
4. **Quản lý Đơn hàng:** Xác nhận đơn hàng, cập nhật trạng thái (đặc biệt quan trọng với việc đối soát cho khách chuyển khoản thủ công).
5. **Quản lý Khách hàng & Mã giảm giá (Voucher).**

### C. Phân quyền Hệ thống (Role-based Access Control)
1. **Admin (Chủ cửa hàng):** Duy nhất 1 tài khoản tối cao. Toàn quyền hệ thống, xem được mọi báo cáo doanh thu, lợi nhuận, cấu hình hệ thống kế toán tiền nong, tạo tài khoản cho nhân viên Sale.
2. **Sale (Nhân viên bán hàng):** Chỉ có quyền quản lý sản phẩm, danh mục, và xử lý/xác nhận đơn hàng của khách. **Tuyệt đối không** được xem báo cáo tổng doanh thu, không được can thiệp vào các cài đặt tiền bạc. Admin quản lý nhiều tài khoản Sale.
3. **User (Khách hàng):** Người dùng cuối, chỉ có quyền mua hàng và xem đơn hàng của chính mình.

### D. Luồng hoạt động cơ bản (Workflow)
1. **Khách hàng** truy cập Web -> Lướt xem Sản phẩm (Giao diện UI/UX đẹp mắt, có thể bộ lọc và search động).
2. Khi ưng ý, khách thêm vào Giỏ hàng -> Tiến hành **Checkout (Thanh toán)**.
3. Khách nhập thông tin nhận hàng -> Hệ thống tự động xác minh (Đăng nhập/Đăng ký nhanh bằng SĐT/Email qua mã OTP).
4. Khách chọn thanh toán (COD hoặc Chuyển khoản). 
   * *Nếu chọn Chuyển khoản:* Hiển thị màn hình QR Code tĩnh kèm mô tả lưu ý cú pháp ck.
   * Đồng thời, hệ thống tự động **gửi Email xác nhận** (thông báo mã đơn, STK).
5. Đơn hàng hiện lên hệ thống Backend với trạng thái `Đang chờ xử lý`.
6. **Nhân viên Sale (hoặc Admin)** đăng nhập trang quản trị:
   * Kiểm tra giao dịch ngân hàng (đối chiếu mã đơn do khách ghi chú).
   * Đổi trạng thái đơn hàng thành `Đã thanh toán` và chuyển qua bước đóng gói / `Đang giao`.
7. Khách hàng nhận được hàng -> Đơn hàng chuyển sang trạng thái `Hoàn thành`.

## 3. Chú trọng Bảo mật (Security)

* **Loại bỏ rủi ro thanh toán online:** Tuyệt đối không sử dụng API của các cổng thanh toán (VNPay, Momo, Stripe...). Thanh toán được đối soát thủ công bởi Admin. Hoàn toàn không có bug logic gây tự động chuyển tiền hay mất tiền oan.
* **Bảo mật Backend (NestJS):**
  * *Authentication:* Dùng JWT lưu trữ ở **HttpOnly Cookies** để chống tấn công đánh cắp token (XSS). 
    * *Cơ chế ngăn mất cắp:* Áp dụng mô hình **Access Token** (sống ngắn hạn 15 phút) và **Refresh Token** (sống vài ngày).
    * Bổ sung cơ chế **Blacklist Token lưu trong Memory/Redis**: Nếu phát hiện Token bị đánh cắp, có hành vi bất thường, hoặc khi User bấm `Đăng xuất`, Refresh Token đó sẽ đưa vào Blacklist và bị vô hiệu hóa hoàn toàn, kẻ gian không thể lấy Token cũ để call API được nữa.
  * *Data Validation:* Dùng `class-validator` để kiểm tra cực kỳ chặt chẽ dữ liệu đầu vào (ví dụ: số tiền không được là số âm, text không chứa script).
  * *Rate Limiting:* Chống Spam API và DDoS cơ bản.
  * *Helmet & CORS:* Cấu hình các HTTP Headers an toàn và giới hạn domain được phép gọi API.
* **Bảo mật Database:** Dùng Prisma ORM tự động map parameter, chống tấn công SQL Injection.

## 4. Kế hoạch Triển khai tự động (CI/CD) & Server

1. **Môi trường:** Chia làm 2 môi trường: `Staging` (để test thử nghiệm) và `Production` (bản chạy cho khách hàng).
2. **Cài đặt Server (VPS):** Setup môi trường Docker, Nginx, PostgreSQL trên nền hệ điều hành Linux (Ubuntu).
3. **Domain & DNS:** Trỏ DNS qua proxy của Cloudflare để tận dụng CDN, ẩn IP gốc và chặn các request độc hại.
4. **Workflow tự động (GitHub Actions):**
   * Khi bạn `git push` code lên nhánh `main`.
   * GitHub Actions tự động chạy Script: Kiểm tra lỗi code -> Build thành các Docker Images -> Push lên Docker Hub hoặc GitHub Container Registry.
   * GitHub Actions tự động SSH vào VPS -> Kéo Image mới nhất -> Chạy lệnh `docker compose up -d` để khởi động lại service. Tốc độ update cực nhanh, downtime gần như bằng 0.

---

## 5. Các quyết định triển khai (Tối ưu cho project học tập - Chi phí 0đ nhưng scale dễ dàng)

Dựa trên yêu cầu của bạn, hệ thống được tinh chỉnh để tận dụng tối đa các dịch vụ **Miễn phí (Free Tier)** nhưng vẫn đủ mạnh để Scale khi có dữ liệu thật:

1. **Lưu trữ hình ảnh:** **Tuyệt đối KHÔNG lưu file ảnh trực tiếp vào Database**, điều này sẽ làm phình to DB, query cực chậm và sai kiến trúc hệ thống. Thay vào đó, dự án sẽ sử dụng gói Free vĩnh viễn của **Cloudinary** (hoặc Firebase Storage). Tới khi scale lên hệ thống cloud (AWS S3), chỉ cần đổi cấu hình key trong file `.env` là xong.
2. **Gửi thông báo Email:** Tích hợp thư viện `Nodemailer` kết nối với SMTP Gmail (miễn phí) hoặc dùng gói Free rất lớn của **Resend** để tự động gửi mail xác nhận đơn / phục hồi mật khẩu.
3. **Tên miền & Máy chủ:** Giai đoạn test, bạn có thể mua một tên miền siêu rẻ (.xyz, .site, .id.vn) và cấu hình vào Nginx trên VPS giá rẻ. Sau này đổi tên miền xịn hoàn toàn không cần phải sửa bất kỳ dòng code nào.

Với các thiết lập này, mọi thứ đã rất rõ ràng: một kiến trúc tối ưu UX/UI với Ant Design, Database mạnh mẽ đủ Role (Admin, Sale, User), luồng checkout không rủi ro và các giải pháp Free xịn xò. Giờ thì **chúng ta có thể bắt tay vào thiết kế Database/Khởi tạo dự án** được rồi!
