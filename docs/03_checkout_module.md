# Module 03: Giỏ hàng & Thanh toán (Cart & Checkout Flow)

## 1. Giỏ hàng Nhỏ (Cart Drawer)
Sử dụng component `Drawer` (thanh trượt từ lề phải sang) thay vì phải load sang 1 trang Giỏ hàng mới nhằm tối đa hóa UX, cho khách duyệt hàng liên tục không bị đứt đoạn.

### A. Giao diện (Mockup Drawer)
```text
[> Đóng]       GIỎ HÀNG CỦA BẠN (2)
---------------------------------------
[ Ảnh ] Áo thun Polo Đen / M
        250.000đ   x [ - 1 + ]    [X]
---------------------------------------
[ Ảnh ] Quần Jeans Xanh / 32
        400.000đ   x [ - 2 + ]    [X]
---------------------------------------
[ Input Mã giảm giá ] [ Áp dụng ]

Tạm tính: 1.050.000đ
(Đã giảm: - 50.000đ)

[ Button Primary khối lớn: ĐI TỚI THANH TOÁN (CHECKOUT) ]
```

### B. Logic Dữ liệu Giỏ Hàng
- **Guest (Chưa đăng nhập):** Giỏ hàng được lưu trong `LocalStorage` thiết bị (Zustand Persist).
- **User (Đã đăng nhập):** Giỏ hàng được đồng bộ từ Backend API.
- **Nút Update Quantity `[ - + ]`:** Gõ debounce 500ms để gửi API lên Backend cập nhật lại giỏ hàng (chống spam).

---

## 2. Trang Thanh toán (Checkout Page)
Là "chốt chặn" làm ra tiền, nên giao diện trang này sẽ gỡ bỏ Header menu cũ để khách hàng **không bị phân tâm** và ấn vào link linh tinh đi mất.

### A. Giao diện (Mockup 2 Cột)
```text
[ Logo Shop (Ấn vào về Trang chủ) ] 
==============================================================
1. THÔNG TIN GIAO HÀNG                  | 2. ĐƠN HÀNG CỦA BẠN
--------------------------------------  | -----------------------------
| Đã có tài khoản? [Đăng nhập ngay]   | | Áo thun Polo (Đen/M)   x 1  |
|                                     | | Quần Jeans (Xanh/32)   x 2  |
| Họ Tên: [ _____________________ ]   | |                             |
| SĐT:    [ _____________________ ]   | | Tạm tính:       1.050.000đ  |
| Email:  [ _Nhận hóa đơn (Tùy)_  ]   | | Mã giảm giá "VUI50":-50.000đ|
| Tỉnh/TP:[ _Select/Tìm kiếm_ v _ ]   | | Phí ship:          30.000đ  |
| Số nhà: [ _____________________ ]   | |-----------------------------|
| Ghi chú:[ _VD: Giao giờ hành chính_]| | T.TIỀN:         1.030.000đ  |
--------------------------------------  ===============================
3. PHƯƠNG THỨC THANH TOÁN               | [ NÚT: CHỐT ĐẶT HÀNG NGAY ] |
(o) Giao hàng tận nơi (COD) - Trả TM    | (Cam kết 100% bảo mật)      |
( ) Chuyển khoản ngân hàng (Sẽ có QR)   |                             |
==============================================================
```

### B. Logic Bảo mật & Dữ liệu 
1. **Nút "Chốt Đặt Hàng" (Submit Checkout):**
   - **Frontend:** Validate không để trống SĐT, Địa chỉ khu vực, Phường Xã. Bắn payload lên API.
   - **Backend:** `POST /api/orders`
     - Backend **tuyệt đối không tin tưởng Tổng tiền** mà Frontend gửi lên. 
     - Backend tự dùng biến thể ID sản phẩm để soi từ DB, nhân lên đơn giá gốc, tự trừ mã giảm giá (Voucher) xem tổng tiền thực tế là bao nhiêu (Chặn đứng việc Client Hack sửa giá).
2. **Logic Tồn Kho (Inventory Locked):**
   - Đơn hàng tạo thành công mang trạng thái `Pending` (Chờ xử lý / Chờ thanh toán).
   - Sản phẩm sẽ tạm thời **bị trừ số lượng trong kho** (VD: Kho có 10 quần, khách đặt 2, kho chỉ còn 8 trên Web). Hệ thống có Cronjob giới hạn thời gian (VD: 12 tiếng), nếu Đơn hàng chưa chuyển sang trạng thái "Xác nhận", kho sẽ tự cộng lại thêm 2 cái áo vào cho người khác mua.

---

## 3. Màn hình Hoàn Tất / Cảm Ơn (Success & Payment Screen)
Trang hiển thị sau khi API Backend trả về tạo Order thành công (Với mã Order: `DH_8X9A2C`).

### A. Logic & Giao diện phụ thuộc Phương thức
- **Nếu chọn `Giao hàng tận nơi (COD)`:**
  - Hiển thị Tick xanh: "Cảm ơn bạn! Đơn hàng DH_8X9A2C đã được đặt thành công. Chúng tôi sẽ gói hàng sớm nhất!"
  - Tự động gọi Service bắn Email `Nodemailer` thông báo Confirm Order vào Mail của khách (nếu có để lại).

- **Nếu chọn `Chuyển Khoản Ngân Hàng` (Offline Payment - Zero Risk):**
  - Hiển thị Text Đỏ mạnh mẽ: "Đơn hàng của bạn đang được giữ chỗ (trong 12h)! Vui lòng thanh toán ngay."
  - Giao diện cung cấp **Mã QR Code Ngân Hàng** (Sử dụng API miễn phí của VietQR sinh ra kèm sẵn thông tin: STK Shop, Số tiền chính xác: 1.030.000đ, Nội dung ck: `DH 8X9A2C`).
  - Khách chỉ việc mở App Bank -> Quét QR -> Bấm chuyển -> Xong việc.
  - Admin sẽ nhận được Notification/Email báo có đơn `Pending CK`. Admin vào Bank App của Admin thấy có tiền + nội dung khớp -> Admin vào Web bấm `Xác nhận đã thu tiền` -> Đơn hàng qua bước Đang Giao.

*Quy trình siêu an toàn, loại bỏ hoàn toàn cổng thanh toán trực tiếp, không sợ bug lỗi tự verify tiền.*
