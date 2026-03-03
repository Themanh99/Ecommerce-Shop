# Module 05: Quản trị Đơn hàng & Người dùng (Admin Orders & Users)

## 1. Tổng quan
- **Mục tiêu:** Xử lý luồng chu chuyển của đơn hàng, bảo vệ doanh thu và Quản lý quyền hạn/tài khoản nhân viên.
- **Actor:** Role `Admin` (Full quyền kiểm soát) và `Sale` (Chỉ xem đơn/Sản phẩm, Không được đụng vào số liệu dòng tiền).
- **UI Components:** Ant Design (Table, Tag biểu thị trạng thái, Steps quy trình, Charts biểu đồ).

## 2. Quản lý Đơn hàng (Order Workflow) - SALE & ADMIN
Là nơi bộ phận Sale hoạt động liên tục mỗi ngày.

### A. Giao diện (Order Board)
- **Menu Tab Lọc nhanh:** `Tất cả` | `Chờ xác nhận (Pending)` | `Đang vận chuyển (Shipping)` | `Hoàn thành (Done)` | `Đã Hủy (Cancelled)`.
- **Cấu trúc Cột:** `Mã Đơn` | `Tên Khách` | `Số ĐT` | `Tổng tiền` | `Phương thức (COD/CK)` | `Trạng thái`.
- Click vào 1 đơn hàng -> Mở Form/Drawer phía bên phải, hiển thị Chi tiết Danh sách món hàng được mua + Thanh Timeline lịch sử (ví dụ: Tạo lúc 08:00, Đổi sang Đang giao lúc 10:00).

### B. Logic xử lý Đơn hàng (Cực kỳ an toàn)
1. **Tiếp nhận đơn mới (Pending):**
   - Đơn khách vừa đặt sẽ mặc định mang trạng thái chờ. Trữ lượng hàng (Tồn Kho) bị Hệ thống Lock (giữ chỗ) tạm thời.
2. **Sale Xác nhận (Verify Payment/Confirm):**
   - Sale mở chi tiết mã đơn (Ví dụ: `DH_8X9A` trị giá 1.030.000đ).
   - *Nếu khách chọn `COD`:* Sale gọi điện chốt đơn, chốt xong bấm Nút xanh: `Xác thực -> Đóng Gói (Processing)`.
   - *Nếu khách chọn `Chuyển Khoản`:* Sale mở App Ngân hàng Shop, đối soát có khoản tiền 1.030.000đ từ "Nguyễn Văn A - Nội dung ck: DH 8X9A". Khớp số tiền + mã -> Sale thao tác trên Web: `Xác nhận Đã thu tiền`.
3. **Thất bại / Hủy bỏ (Automation Cancel):**
   - Để tránh thất thoát do khách đặt "cho vui", sau 12h không chuyển khoản (hoặc không nghe máy) -> **Cronjob (Schedule Job chạy ngầm trên Server)** tự động chuyển đơn sang `Cancelled`. 
   - Giải phóng lại toàn bộ lượng tồn kho đã trót giữ chỗ về lại hệ thống để có hàng bán cho người đến sau.

## 3. Module Thông báo Alert (Hậu trường Backend)
- **Kỹ thuật:** Lắng nghe Event (Event Emitter của NestJS).
- **Trigger Gửi Email (Resend / Nodemailer):** 
  - Đơn chuyển sang `Đang đóng gói/Giao` -> Backend tự động gửi Email báo tin: *"Yay! Đơn hàng DH_8X9A của bạn đang được lên đường! Cảm ơn bạn"*
  - Đơn chuyển thành `Đã Hủy` -> Gửi Email: *"Rất tiếc, đơn hàng đã bị hủy bỏ do quá hạn thời gian thanh toán/nhận hàng."*

## 4. Dashboard Doanh Thu & Analytics (CHỈ ADMIN THẤY)
Trang giám sát tài chính và phân tích mức độ tiêu thụ sản phẩm của Shop.
- **Logic Phân quyền Chặt chẽ:**
  - Payload JWT Token của các User được đánh dấu `Role: ADMIN` hoặc `Role: SALE`. 
  - Nếu tài khoản Sale tò mò gõ thanh địa chỉ `/admin/dashboard`, Frontend Route Guards sẽ chặn và Backend Middleware API cũng đá văng ra khỏi lỗi "403 Forbidden" (Không có quyền truy cập).
- **Giao diện Chart Analytics:** 
  - Biểu đồ Doanh thu Đường (Line Chart) cho 7/30 ngày qua (Sử dụng thư viện Recharts).
  - Thống kê (Statistic): Tổng tiền thu trong tuần, Tổng tiền hoàn.
  - Xếp hạng Top 5 Sản phẩm bán chạy nhất tháng để có kế hoạch nhập thêm hàng (Restock).

## 5. Cấp Quyền & Quản lý Nhân sự (Account Management) - CHỈ ADMIN
- Hệ thống Admin Panel không cho phép Nhân viên tự ý Đăng ký. **Tài khoản là do Admin cấp (Create)**.
- Admin điền Tên, Email, Mật khẩu mặc định -> Web mã hóa an toàn (`Bcrypt`) và ấn định Quyền (Role `SALE`). Nhân viên nhận tài khoản và đăng nhập bắt đầu làm việc.
- Chế độ đuổi việc lập tức: Bất cứ khi nào Sale nghỉ việc -> Admin bấm Nút `Ban/Deactivate` -> Sale đó (dù đang ngồi đăng nhập ở máy khác) sẽ lập tức bị Kickout khỏi hệ thống thông qua cơ chế **Blacklist JWT ở Redis** chặn Token. Tăng tính bảo mật cho cửa hàng.
