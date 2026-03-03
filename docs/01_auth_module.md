# Module 01: Xác thực & Tài khoản (Authentication)

## 1. Tổng quan
- **Mục tiêu:** Quản lý quy trình đăng ký, đăng nhập, khôi phục mật khẩu và bảo mật Token.
- **Actor (Người dùng):** Guest (Khách vãng lai), User (Khách hàng đã đăng ký).
- **Công nghệ UI:** Ant Design (Modals, Forms, Inputs, Buttons, Messages).

## 2. Màn hình Khởi tạo (Auth Modal)
Mọi luồng đăng nhập/đăng ký được gộp chung vào 1 Modal Popup (không nhảy trang) để tăng cường trải nghiệm người dùng.

### A. Giao diện (UI Mockup)
```text
+--------------------------------------------------+
| [X] Đóng                                         |
|                 [ Logo Shop ]                    |
|       Đăng nhập hoặc Đăng ký để tiếp tục         |
|                                                  |
|  [ Input SĐT hoặc Email: placeholder... ]        |
|                                                  |
|  [ Button (Primary): Tiếp tục ]                  |
|                                                  |
|  ----- Hoặc đăng nhập bằng -----                 |
|  [ Button (Outlined/Ghost): Google ]             |
+--------------------------------------------------+
```

### B. Logic hoạt động (Actions & State)
1. **Trạng thái khởi tạo:** Input trống, Button `Tiếp tục` bị disabled.
2. **Action: Nhập dữ liệu (Validation):** Kiểm tra Regex chặt chẽ định dạng SĐT Việt Nam hợp lệ hoặc Email. Nếu đúng format -> Enable nút. Nếu bị bỏ trống hoặc sai Regex -> UI Component tự văng dòng Validate Đỏ cảnh báo.
3. **Action: Click "Tiếp tục" (`btn-continue`):**
   - Đổi state thành `isLoading = true`, nút hiển thị icon xoay xoay (Spinner).
   - Gọi API: `POST /api/auth/check-identity`
   - Kết quả **HTTP 200 (Chưa tồn tại)**:
     - Hệ thống Backend tự động sinh và gửi mã OTP (qua Email hoặc SMS).
     - UI chuyển sang **Bước Đăng ký**.
   - Kết quả **HTTP 409 (Đã tồn tại)**:
     - UI chuyển sang **Bước Đăng nhập**.
4. **Action: Nhấn Đăng nhập nhanh bằng Google:**
   - Sử dụng `Google OAuth2`. Khách có thể 1-click vào App siêu tốc không cần thao tác nhiều. 
   - **Lưu ý nghiệp vụ:** Tài khoản Google **không có sẵn số điện thoại thật**. Tuy nhiên ở bước Checkout (Thanh toán), Form sẽ bắt buộc Validate có Số điện thoại, lúc này hệ thống sẽ đòi Khách nhập 1 SDT và gửi OTP xác nhận -> Đảm bảo đơn thật, không tạo User Rác.

---

## 3. Luồng Đăng ký (Register Flow)
### A. Giao diện (Tiếp nối Modal)
```text
+--------------------------------------------------+
| [<] Trở lại                                      |
|            Đăng ký tài khoản mới                 |
|   Mã xác nhận (OTP) đã được gửi đến: 098****123  |
|                                                  |
|   [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] (OTP Input)|
|   Chưa nhận được? [ Gửi lại (59s) ]              |
|                                                  |
|   [ Input họ và tên: VD. Nguyễn Văn A ]          |
|   [ Input mật khẩu mới ] (Tùy chọn)              |
|                                                  |
|   [ Button (Primary): Hoàn tất Đăng ký ]         |
+--------------------------------------------------+
```
### B. Logic & Validation
- **OTP Component:** Dùng `Input.OTP` (Ant Design 5.x). Tự động focus sang ô tiếp theo.
- **Password Input:** Gắn sẵn icon Mắt (Show/Hide). Không ép nhập nếu chỉ muốn đăng nhập bằng OTP sau này.
- **Action: Click "Hoàn tất":** 
  - Loading state.
  - API trả về Cookie + Thông tin User -> Bắn popup success -> Đóng Modal.

---

## 4. Luồng Đăng nhập & Quên Mật Khẩu (Login Flow)
### A. Giao diện (Tiếp nối Modal)
```text
+--------------------------------------------------+
| [<] Trở lại                                      |
|             Chào mừng quay trở lại               |
|                                                  |
|  [ Input (Disabled): 098****123 ]                |
|  [ Input Mật khẩu ]  ->  [Link: Quên mật khẩu?]  |
|                                                  |
|  [ Button (Primary): Đăng nhập ]                 |
|                                                  |
|  [ Button (Text): Đăng nhập bằng mã OTP ]        |
+--------------------------------------------------+
```
### B. Quên mật khẩu (Forgot Password Action)
- Click `Quên mật khẩu?` -> Form đổi giao diện chuyển sang:
  - Text: "Gửi mã phục hồi đến 098****123".
  - Button "Gửi mã (Send Code)".
  - Sau khi nhận mã và nhập OTP đúng (gọi API Verify Code), màn hình hiện 2 Input "Mật khẩu mới" và "Xác nhận mật khẩu".
  - Save đổi mật khẩu -> Gọi API Reset Password -> Chuyển lại Form Đăng nhập.

---

## 5. Security Token & Phân Luồng (Routing)
- **Quá trình Đăng nhập thành công:**
  - Backend xử lý: Trả về Token Set thẳng vào Cookie (`HttpOnly; Secure; SameSite=Strict`). 
  - Token Payload (Frontend giải mã Base64) chứa thông tin `Role` (Ví dụ: `USER`, `ADMIN`, `SALE`).
- **Phân luồng dựa trên Role (Redirection logic):**
  - Nếu `Role === 'ADMIN'` hoặc `SALE`: Frontend tự động chuyển hướng đường dẫn thẳng vào dải `/admin/...` (Vào Dashboard cho admin hoặc Bảng Đơn Hàng cho Sale).
  - Nếu `Role === 'USER'`: Đóng Modal, duy trì khách hàng ở nguyên Trang chủ `/` hoặc link SP Khách đang xem dở để tăng Conversion cho mượt mà nhất.
  - Frontend không thể đọc Token gốc ẩn trong Cookie nhưng được phép giữ lại cái Data Payload (Zustand State) để render cái Tên Avatar ở góc phải màn hình.
- **Hết hạn Token:**
  - Axios Interceptor (ở phía Frontend Vite) nếu Request bị lỗi `401 Unauthorized` -> Sẽ ngầm bắn request tới `/api/auth/refresh` để xin cấp lại Cookie. Nếu Cookie refresh hết hạn, bắt User lôi Modal Login ra lại.
- **Logout (Đăng xuất):**
  - Nhấn nút Đăng xuất -> Gọi API `/api/auth/logout`.
  - Backend: Lưu `refresh_token` hiện lưu trong Request vào Blacklist (Redis).
  - Clear Token Cookie. Dù kẻ xấu có copy Cookie đi máy khác thì token đã bị chặn tại DB.

---

## 6. Tiêu chuẩn Setup Codebase & Giao diện (System Standard)
Để đảm bảo dự án Dễ mở rộng, Code chuyên nghiệp và Thẩm mỹ cao, các nguyên tắc bắt buộc sau sẽ được tuân thủ khi viết code Frontend:

1. **Responsive Design (Mobile First):** 
   - UI Code sẽ được Base cho Màn hình điện thoại (`Mobile`) chuẩn nhất, gọn gàng nhất (Vì đa số khách hiện nay mua hàng trên Smartphone).
   - Sau đó dùng Tailwind/CSS Media Query (`md:`, `lg:`) tự scale ra nhiều dạng cho Tablet (iPad) và cuối cùng rộng ra cho Desktop. Cam kết **Không bao giờ bị vỡ Layout!**
2. **Kiến trúc UI / Layout Generic:** 
   - Gom Layout (Header, Footer, Sidebar, Layout Trang Chủ hay Layout trang Admin) vào những file Higher-Order Component riêng.
   - Các Nút bấm, Ô input sẽ được gói trong Component chuẩn (vd: `CustomButton`, `CustomInput`) để giao diện Đồng nhất 100% thay vì chỗ gõ thẻ tag này chỗ gõ thẻ khác rối rắm.
3. **Thư viện Utils (Code Helper Utils):**
   - Viết riêng Folder util/ để chứa các hàm dùng đi dùng lại.
   - Hàm `formatCurrency(1000)` đổi nhanh thành chữ `1.000đ` chuẩn Việt Nam.
   - Hàm `formatDate(time)` đổi timestamp CSDL thành giờ giấc dễ nhìn (Vd: `15:30 - Ngày 24/09/2024`) dùng thư viện xịn như `date-fns` hay `dayjs`.
4. **Validation Mọi Nơi:**
   - Dùng thư viện `Zod` kết hợp `React Hook Form` để chặn và báo đỏ thẳng ở màn hình: Bắt form phải điền tên, Kiểm tra định dạng Email, Chặn chữ bay vào ô Giá. 
   - API Backend thì tiếp tục bảo vệ thêm lớp số 2 bằng `class-validator` chặn Data rác từ API Call bên ngoài. Mọi thứ được kiểm soát 100%.
