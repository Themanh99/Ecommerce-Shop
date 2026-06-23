# 📋 Phân tích Nghiệp vụ & Thiết kế Chi tiết Chức năng (Functional Specs)

> **Dự án:** BabyShop (Thời trang trẻ em)  
> **Phiên bản:** v2.0 — Redesign  
> **Ngày cập nhật:** 2026-06-23  
> **Tài liệu:** Bản tả chi tiết luồng nghiệp vụ, logic xử lý và phân rã chức năng hệ thống từ đầu đến đuôi.

---

## 1. PHÂN HỆ KHÁCH HÀNG (STOREFRONT & USER MODULE)

### 1.1 Xác thực và Đăng ký/Đăng nhập (Auth Flow)
Quy trình xác thực được thiết kế tích hợp (Unified Modal) giúp tối giản số lần click và chuyển trang của khách hàng.

#### A. Luồng Đăng nhập/Đăng ký tích hợp (Unified Flow)
1. **Khởi đầu:** Khách hàng bấm nút "Đăng nhập/Đăng ký" tại header -> Xuất hiện Modal Popup.
2. **Nhập định danh:** Khách hàng nhập Số điện thoại (SĐT) hoặc Email vào một trường duy nhất.
   - *Logic kiểm tra định dạng (Validation):*
     - Định dạng Email: Chuỗi chứa ký tự `@` và domain hợp lệ.
     - Định dạng SĐT: Bắt đầu bằng `0` hoặc `+84`, tiếp theo là 9 chữ số (khớp regex SĐT Việt Nam).
   - *Hành động:* Sau khi nhập đúng định dạng, nút "Tiếp tục" được kích hoạt (enabled).
3. **Kiểm tra sự tồn tại (Identity Check):** Hệ thống gửi request `POST /api/auth/check-identity` lên backend.
   - **Trường hợp 1: Định danh chưa tồn tại trong hệ thống (Đăng ký mới)**
     - Backend tạo mã OTP gồm 6 chữ số, thời gian hết hạn là 5 phút (lưu tạm vào Redis với key `otp:{contact}`).
     - Gửi OTP qua Email (dùng Nodemailer) hoặc SMS (nếu tích hợp Brandname SMS).
     - Giao diện Modal chuyển sang trạng thái **Nhập mã OTP**.
     - Khách hàng điền mã OTP -> Hệ thống xác minh mã OTP:
       - *OTP đúng:* Mở tiếp các trường nhập thông tin cá nhân: Họ và tên (Bắt buộc), Mật khẩu (Tự chọn).
       - *OTP sai:* Báo đỏ cảnh báo, cho phép nhập lại. Sau 60 giây cho phép bấm "Gửi lại mã".
       - Khách hàng điền thông tin cá nhân và bấm "Hoàn tất đăng ký" -> Tạo tài khoản mới, tạo giỏ hàng trống liên kết với User ID, trả về cookie JWT và đăng nhập thành công.
   - **Trường hợp 2: Định danh đã tồn tại (Đăng nhập)**
     - Giao diện Modal chuyển sang màn hình **Nhập mật khẩu**.
     - Khách hàng nhập mật khẩu -> Bấm "Đăng nhập" -> Xác thực mật khẩu với mật khẩu đã hash trong cơ sở dữ liệu (sử dụng `bcrypt.compare`).
       - *Mật khẩu đúng:* Đăng nhập thành công, trả về cookie JWT.
       - *Mật khẩu sai:* Cảnh báo sai mật khẩu, cho phép thử lại. Có đường dẫn "Đăng nhập bằng mã OTP" để chuyển sang luồng gửi mã OTP thay thế mật khẩu.

#### B. Luồng Đăng nhập nhanh bằng Google OAuth2
1. Khách hàng click nút "Tiếp tục với Google" trên Auth Modal.
2. Trình duyệt chuyển hướng đến màn hình xác thực của Google.
3. Sau khi xác thực thành công, Google chuyển hướng kèm theo code về `GOOGLE_CALLBACK_URL` của Backend.
4. Backend nhận thông tin (Email, Tên, Avatar URL từ Google profile):
   - Nếu Email đã tồn tại -> Liên kết với tài khoản cũ (nếu chưa liên kết) và trả về cookie đăng nhập.
   - Nếu Email chưa tồn tại -> Tạo mới tài khoản (role `USER`), tự động gán trạng thái đã kích hoạt.
5. **Ràng buộc nghiệp vụ đặc biệt:** Do tài khoản Google không cung cấp Số điện thoại, người dùng này vẫn có thể duyệt Web nhưng khi chuyển tới bước Thanh toán (Checkout), hệ thống sẽ kiểm tra tài khoản đã có SĐT chưa. Nếu chưa, yêu cầu nhập SĐT -> Gửi OTP xác thực SĐT -> Lưu SĐT vào thông tin User trước khi cho phép đặt hàng để ngăn chặn đơn hàng ảo.

#### C. Luồng Quên Mật khẩu
1. Tại màn hình nhập mật khẩu, khách hàng bấm "Quên mật khẩu?".
2. Hệ thống tự động gửi mã OTP xác nhận về Email/SĐT đã nhập.
3. Modal hiển thị ô nhập mã OTP (6 chữ số).
4. Xác minh OTP thành công -> Hệ thống hiển thị form nhập mật khẩu mới (yêu cầu tối thiểu 8 ký tự, có chữ và số) kèm ô xác nhận mật khẩu mới.
5. Bấm "Cập nhật" -> Backend lưu mật khẩu mới đã hash, xóa bỏ các session đăng nhập cũ (xóa refreshToken trong DB và blacklist token cũ ở Redis) -> Yêu cầu người dùng đăng nhập lại bằng mật khẩu mới.

---

### 1.2 Duyệt và Tìm kiếm Sản phẩm (Storefront Catalog)
Nghiệp vụ hiển thị sản phẩm thời trang trẻ em cần tính sinh động và bộ lọc trực quan cao.

#### A. Trang chủ (Home Page)
- **Banner Slider:** Hiển thị danh sách ảnh banner đang hoạt động (`isActive = true`), sắp xếp theo thứ tự hiển thị (`sortOrder`). Có thời hạn lên lịch hiển thị (`startsAt` và `endsAt`). Khi click vào banner, chuyển hướng đến URL chương trình khuyến mãi đính kèm.
- **Danh mục nổi bật (Featured Categories):** Hiển thị danh sách các danh mục cấp 1 dạng biểu tượng tròn kèm hình minh họa (Ví dụ: Đồ bé trai, Đồ bé gái, Sơ sinh, Phụ kiện).
- **Bộ sưu tập đặc biệt (Bento Grid / Carousels):**
  - **Sản phẩm Hot/Bán chạy (Best Sellers):** Tự động thống kê dựa trên số lượng bán ra của sản phẩm trong 30 ngày gần nhất.
  - **Sản phẩm mới (New Arrivals):** Lấy danh sách sản phẩm mới tạo gần đây (`createdAt` giảm dần) có đánh dấu nổi bật (`isFeatured = true`).

#### B. Trang Danh sách Sản phẩm (Product Listing & Filtering)
Trang hiển thị tất cả sản phẩm hoặc theo Danh mục cụ thể. Tích hợp bộ lọc đa chiều (Faceted Search) hoạt động tức thì (Real-time Filter):
1. **Lọc theo Danh mục (Category Tree):**
   - Hỗ trợ phân cấp cha-con (Ví dụ: Chọn danh mục "Áo Bé Trai" sẽ hiển thị cả sản phẩm thuộc danh mục con "Áo thun bé trai", "Áo sơ mi bé trai").
2. **Lọc theo Giá:**
   - Dùng thanh trượt khoảng giá (Slider từ giá Min đến giá Max).
   - Tự động gợi ý 3 khoảng giá phổ biến (Ví dụ: Dưới 100k, 100k - 300k, Trên 300k).
3. **Lọc theo Thuộc tính biến thể (Attributes):**
   - Lọc theo Size (Ví dụ: 1Y, 2Y, 3Y, S, M, L).
   - Lọc theo Màu sắc (Hiển thị dạng bảng màu trực quan - Color Swatches).
4. **Lọc theo Tag:** Lọc nhanh các nhãn ngang như "Sale", "Hàng mới về", "Organic Cotton".
5. **Sắp xếp (Sorting):** Theo giá tăng dần, giá giảm dần, mới nhất, bán chạy nhất.
6. **Cơ chế Phân trang (Pagination):** Hỗ trợ Infinite Scroll (cuộn tải thêm) ở thiết bị di động hoặc Phân trang truyền thống (Pagination) ở Desktop. Mặc định hiển thị 24 sản phẩm/trang.

#### C. Trang Chi tiết Sản phẩm (Product Detail)
Cung cấp toàn bộ thông tin thuyết phục khách hàng bỏ sản phẩm vào giỏ.
- **Image Gallery:** Hiển thị ảnh đại diện chính của sản phẩm và các ảnh chi tiết phụ (dạng slider). Hỗ trợ zoom ảnh khi hover chuột và xem ảnh kích thước lớn khi click vào.
- **Thông tin cơ bản:** Tên sản phẩm, mã SKU gốc, giá bán hiện tại, giá gốc (gạch ngang nếu có giảm giá), nhãn giảm giá (%), số sao đánh giá trung bình.
- **Bảng chọn Biến thể (Variant Selector):**
  - Khách chọn từng thuộc tính (Màu sắc trước -> Size sau).
  - *Logic tương tác:* Khi chọn xong Màu sắc, hệ thống tự động ẩn hoặc làm mờ (disabled) các lựa chọn Size đã hết hàng đối với màu sắc đó (dựa trên tồn kho real-time).
  - Khi chọn đầy đủ các thuộc tính của biến thể -> Hiển thị chính xác mã SKU cụ thể, giá bán riêng của biến thể đó, số lượng tồn kho còn lại, và cập nhật nút "Thêm vào giỏ hàng" (từ xám/disabled thành cam/enabled).
- **Size Chart (Bảng chọn size):** Nút mở Pop-up hướng dẫn đo kích thước chiều cao/cân nặng cho bé để chọn size chuẩn xác nhất (Giảm thiểu tỷ lệ đổi trả hàng).
- **Mô tả chi tiết:** Hỗ trợ hiển thị văn bản định dạng phong phú (Rich Text) bao gồm hình ảnh chi tiết và bảng số liệu.
- **Đánh giá & Bình luận (Customer Reviews):**
  - Hiển thị danh sách đánh giá từ những khách hàng **đã mua sản phẩm thực tế** (xác thực mua hàng).
  - Hiển thị điểm số trung bình (1-5 sao) kèm tỷ lệ % từng mức sao.
  - Cho phép khách xem ảnh chụp thực tế từ phần đánh giá của khách hàng khác.

---

## 2. PHÂN HỆ GIỎ HÀNG & MÃ GIẢM GIÁ (CART & PROMOTION MODULE)

### 2.1 Nghiệp vụ Giỏ hàng (Cart Mechanics)

#### A. Trạng thái Giỏ hàng
Hệ thống quản lý giỏ hàng song song trên 2 môi trường:
- **Giỏ hàng Khách vãng lai (Guest Cart):** Lưu trữ hoàn toàn tại client (`localStorage` của trình duyệt) thông qua State Manager (Zustand Persist). Lưu thông tin rút gọn: `{ variantId, quantity }`.
- **Giỏ hàng Thành viên (User Cart):** Lưu trữ trong cơ sở dữ liệu (`Cart` và `CartItem`). Mỗi khi người dùng thao tác, gọi API để đồng bộ dữ liệu.

#### B. Thao tác trên Giỏ hàng
- **Thêm sản phẩm:**
  - *Logic kiểm tra:* Kiểm tra số lượng thêm vào cộng với số lượng đã có trong giỏ không được vượt quá số lượng tồn kho khả dụng của biến thể sản phẩm đó (`stockAvailable = stock - stockReserved`).
- **Cập nhật số lượng (Tăng/Giảm/Nhập số):**
  - Sử dụng cơ chế **Debounce 500ms** trước khi gửi request API cập nhật lên server để tránh tình trạng spam click làm quá tải DB và sinh sai lệch dữ liệu.
- **Xóa sản phẩm:** Xóa từng dòng hoặc nút "Xóa tất cả sản phẩm hết hàng" để dọn sạch giỏ.
- **Đồng bộ hóa khi Đăng nhập (Cart Merge):**
  - Khi một Guest đăng nhập thành công: Hệ thống quét các item trong `localStorage`.
  - Gửi danh sách item này lên backend thông qua API `POST /api/cart/merge`.
  - Backend thực hiện logic:
    - Nếu sản phẩm trong localStorage chưa có trong DB -> Thêm mới vào DB.
    - Nếu đã có trong DB -> Cộng dồn số lượng (nhưng tối đa không vượt quá giới hạn tồn kho).
    - Clear giỏ hàng trong `localStorage`.

---

### 2.2 Nghiệp vụ Mã giảm giá (Voucher & Discount)

#### A. Các loại Voucher hỗ trợ
- **Voucher theo phần trăm (%):** Giảm x% trên tổng giá trị đơn hàng, có thiết lập mức giảm tối đa (Ví dụ: Giảm 10%, tối đa 50.000đ).
- **Voucher cố định (Số tiền cụ thể):** Giảm trực tiếp x đồng (Ví dụ: Giảm 30.000đ).
- **Voucher miễn phí vận chuyển (Freeship):** Giảm trực tiếp vào tiền phí vận chuyển của đơn hàng.

#### B. Quy trình Áp dụng & Điều kiện ràng buộc
Khi khách hàng nhập mã Voucher vào giỏ hàng hoặc trang checkout:
1. **Kiểm tra tính hợp lệ của mã:**
   - Mã có tồn tại và đang hoạt động (`isActive = true`) hay không?
   - Thời gian sử dụng hiện tại có nằm trong khoảng `startDate` và `endDate` không?
   - Số lượng mã còn lại (`usageLimit - usedCount > 0`) không?
2. **Kiểm tra điều kiện đơn hàng:**
   - Giá trị đơn hàng tối thiểu (`minOrderValue`) có đạt yêu cầu không? (Ví dụ: Mã áp dụng cho đơn từ 300k).
   - Mỗi khách hàng chỉ được dùng tối đa x lần (`limitPerUser`). Hệ thống kiểm tra số lần đã dùng của tài khoản hiện tại trong bảng `VoucherUser`.
3. **Tính toán số tiền giảm:**
   - Việc tính toán số tiền được giảm **bắt buộc phải thực hiện ở Backend** khi render thông tin checkout và khi tạo order thực tế.
   - Trả về chi tiết: Số tiền được giảm (`discountAmount`), số tiền còn lại sau giảm (`finalTotal`).

---

## 3. PHÂN HỆ THANH TOÁN & ĐẶT HÀNG (CHECKOUT & ORDER FULFILLMENT)

Đây là phân hệ cốt lõi nhất của hệ thống, đòi hỏi tính chính xác cực cao về dòng tiền, thông tin giao nhận và quản lý tồn kho để tránh thất thoát tài sản của cửa hàng.

### 3.1 Quy trình Đặt hàng (Checkout Flow)

```
[Khách hàng]                      [Hệ thống Backend]               [Redis/DB]
     │                                     │                           │
     │── 1. Gửi Đơn hàng ─────────────────▶│                           │
     │   (Địa chỉ, Giỏ hàng, Voucher)      │                           │
     │                                     │── 2. Khóa tồn kho tạm ───▶│ (Atomic DECRBY)
     │                                     │    (Redis & stockReserved)│
     │                                     │                           │
     │                                     │── 3. Tự tính lại tiền ───│ (So sánh DB gốc)
     │                                     │    (Anti-tampering)       │
     │                                     │                           │
     │                                     │── 4. Tạo Order Pending ──▶│ (Lưu DB)
     │                                     │                           │
     │◀── 5. Mã Đơn hàng & Dynamic QR ─────│                           │
     │                                     │                           │
```

#### Bước 1: Nhập thông tin giao hàng
- Họ tên người nhận, SĐT người nhận.
- Địa chỉ chi tiết: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã (chọn từ danh bạ hành chính chuẩn hóa để phục vụ tích hợp giao hàng sau này), Số nhà/Tên đường.
- Ghi chú giao hàng (nếu có).

#### Bước 2: Phương thức thanh toán & Giao hàng
- Chọn phương thức:
  - **COD (Giao hàng thu tiền hộ):** Khách nhận hàng mới trả tiền cho shipper.
  - **Chuyển khoản ngân hàng (VietQR):** Khách tự quét mã chuyển khoản trước khi giao hàng.
- Phí vận chuyển: Hệ thống tự tính phí vận chuyển dựa trên khu vực địa lý của Tỉnh/Thành phố nhận hàng (Cấu hình trong phần cấu hình hệ thống, ví dụ: Nội tỉnh 20k, Ngoại tỉnh 30k, Đơn từ 500k Freeship).

#### Bước 3: Đặt hàng và Khóa tồn kho tạm thời (Inventory Lock)
Khi bấm "Đặt hàng", backend nhận dữ liệu và thực hiện tuần tự các bước trong 1 **Database Transaction**:
1. **Kiểm tra và Trừ tồn kho tạm thời trên Redis:**
   - Hệ thống thực hiện lệnh atomic `DECRBY` số lượng trên các key tồn kho của Redis `stock:available:{variantId}`.
   - Nếu có bất cứ sản phẩm nào trả về giá trị âm (< 0), ngay lập tức hoàn tác (`INCRBY` lại số lượng cũ) và dừng giao dịch, trả về thông báo lỗi "Sản phẩm A đã hết hàng".
2. **Khóa tồn kho trong PostgreSQL:**
   - Cập nhật số lượng của các biến thể tương ứng trong bảng `ProductVariant`: tăng giá trị trường `stockReserved` bằng số lượng khách đặt (Không trừ trực tiếp vào trường `stock` vật lý vì đơn chưa được hoàn thành).
3. **Tính toán số tiền (Anti-Tampering):**
   - Backend lấy giá sản phẩm trực tiếp từ DB.
   - Tính toán tổng tiền hàng, áp dụng Voucher, cộng phí vận chuyển để ra Tổng tiền thanh toán cuối cùng.
   - So sánh với tổng tiền khách thấy trên giao diện để đảm bảo không có sự sai lệch hay can thiệp phá hoại dữ liệu.
4. **Tạo bản ghi Đơn hàng (Order):**
   - Tạo bản ghi mới trong bảng `Order` với trạng thái `PENDING` (Chờ xác nhận).
   - Lưu trữ toàn bộ thông tin sản phẩm mua vào bảng `OrderItem` theo cơ chế **Snapshot Pattern** (Sao chép cứng tên sản phẩm, đơn giá, ảnh đại diện tại thời điểm mua vào bảng OrderItem. Nếu sau này Admin có đổi giá hay xóa sản phẩm, đơn hàng cũ vẫn giữ nguyên thông tin gốc lịch sử).
   - Tự động sinh mã đơn hàng ngẫu nhiên dạng chữ và số, viết hoa, dễ đọc (Ví dụ: `BK260623AB`).
   - Thiết lập thời gian hết hạn thanh toán cho đơn hàng (`expiresAt = Now() + 12h`).

---

### 3.2 Xử lý Thanh toán thủ công bằng mã QR động (Manual Bank Transfer via VietQR)

Do hệ thống không tích hợp cổng thanh toán trực tuyến tự động (nhằm giảm chi phí và rủi ro vận hành kỹ thuật), luồng chuyển khoản thủ công được tối ưu hóa như sau:

1. **Sinh mã QR thông minh:**
   - Sau khi tạo đơn hàng thành công với phương thức "Chuyển khoản", hệ thống chuyển khách sang trang Cảm ơn & Thanh toán.
   - Backend gửi yêu cầu sinh ảnh QR động từ dịch vụ VietQR (VietQR.io) với các tham số:
     - Số tài khoản nhận tiền của Shop.
     - Tên Ngân hàng thụ hưởng.
     - Số tiền chuyển khoản chính xác bằng: `finalTotal` của đơn hàng.
     - Nội dung chuyển khoản bắt buộc khớp 100% với mã đơn hàng (Ví dụ: `BK260623AB`).
2. **Trải nghiệm khách hàng:**
   - Khách hàng mở ứng dụng ngân hàng bất kỳ trên điện thoại -> Quét mã QR.
   - Mọi thông tin (Số tài khoản, Số tiền, Nội dung chuyển khoản) được điền tự động 100%, khách không cần gõ thủ công bất cứ thông tin nào -> Hạn chế tối đa việc chuyển nhầm số tiền hoặc sai nội dung đối soát.
   - Khách bấm "Xác nhận chuyển khoản" tại App Bank và chờ đợi nhân viên shop xử lý.

---

### 3.3 Chu trình Trạng thái Đơn hàng (Order Lifecycle)

Đơn hàng di chuyển qua các trạng thái nghiêm ngặt dưới sự vận hành của Sale và Admin:

```
                  ┌───────────────┐
                  │    PENDING    │ (Khách đặt hàng thành công)
                  └───────┬───────┘
                          │
          ┌───────────────┴───────────────┐
          ▼ (Sale gọi điện hoặc đối soát)  ▼ (Hết 12h chưa thanh toán)
  ┌───────────────┐               ┌───────────────┐
  │   CONFIRMED   │               │   CANCELLED   │ (Hủy đơn, hoàn tồn kho)
  └───────┬───────┘               └───────────────┘
          │
          ▼ (Kho đóng hàng)
  ┌───────────────┐
  │  PROCESSING   │
  └───────┬───────┘
          │
          ▼ (Giao cho Ship)
  ┌───────────────┐
  │   SHIPPING    │
  └───────┬───────┘
          │
          ▼ (Giao thành công)
  ┌───────────────┐
  │     DONE      │ (Hoàn tất, ghi nhận doanh thu)
  └───────────────┘
```

#### A. Chi tiết các bước chuyển trạng thái:

1. **PENDING ➔ CONFIRMED:**
   - *Điều kiện chuyển:*
     - Với đơn COD: Nhân viên Sale gọi điện xác nhận đúng SĐT, đúng thông tin địa chỉ người nhận.
     - Với đơn Chuyển khoản: Nhân viên Sale kiểm tra tài khoản ngân hàng của cửa hàng thấy có biến động số dư khớp đúng số tiền và nội dung chuyển khoản là mã đơn hàng.
   - *Hành động trên hệ thống:* Sale bấm nút "Xác nhận đơn" trên Admin Panel. Hệ thống cập nhật trạng thái đơn thành `CONFIRMED`.
2. **CONFIRMED ➔ PROCESSING:**
   - Bộ phận kho in phiếu đóng gói, lấy hàng ra khỏi kệ, đóng gói và dán nhãn vận chuyển của các đơn vị đối tác (GHTK, GHN, Viettel Post...).
   - Hệ thống chuyển trạng thái đơn sang `PROCESSING`.
3. **PROCESSING ➔ SHIPPING:**
   - Khi Shipper đến lấy hàng và quét mã nhận hàng thành công, Sale cập nhật Mã vận đơn (Tracking Code) vào chi tiết đơn hàng trên web và chuyển trạng thái đơn hàng sang `SHIPPING`.
4. **SHIPPING ➔ DONE:**
   - Sau khi đơn vị vận chuyển cập nhật trạng thái "Giao hàng thành công" và thu tiền (đối với COD), Sale bấm nút "Hoàn thành đơn hàng".
   - *Hành động hệ thống:*
     - Trừ trực tiếp số lượng vật lý trong kho ở trường `stock` của bảng `ProductVariant` (giảm `stock`, đồng thời giảm `stockReserved` tương ứng số lượng hàng đã bán thực tế).
     - Ghi nhận doanh thu chính thức cho hệ thống.
     - Gửi email cảm ơn kèm đường dẫn đánh giá sản phẩm cho khách hàng.
5. **HỦY ĐƠN HÀNG (PENDING ➔ CANCELLED):**
   - *Xảy ra khi:*
     - Khách hàng tự bấm "Hủy đơn" tại màn hình quản lý đơn cá nhân (chỉ thực hiện được khi đơn ở trạng thái `PENDING`).
     - Nhân viên Sale bấm "Hủy đơn" do liên hệ khách hàng nhiều lần không được, hoặc khách báo hủy trực tiếp qua điện thoại.
     - **Tự động hủy qua Cronjob (Automated Cancel Job):**
       - Định kỳ mỗi 30 phút, một cronjob ngầm của backend quét qua toàn bộ cơ sở dữ liệu bảng `Order`.
       - Lọc ra các đơn hàng ở trạng thái `PENDING`, có phương thức thanh toán là Chuyển khoản, và thời gian hiện tại đã vượt quá thời gian hết hạn (`expiresAt < NOW()`).
       - Hệ thống tự động chuyển các đơn hàng này sang trạng thái `CANCELLED`.
   - *Hành động hệ thống khi Hủy đơn (Mục tiêu hoàn trả tồn kho):*
     - Backend cập nhật giảm số lượng `stockReserved` tương ứng của các biến thể sản phẩm trong DB.
     - Thực hiện lệnh atomic `INCRBY` để cộng trả lại số lượng tồn kho khả dụng lên Redis key `stock:available:{variantId}`.
     - Lưu lịch sử thay đổi vào bảng `OrderStatusLog` với ghi chú: "Hệ thống tự động hủy đơn do quá hạn 12h thanh toán".
     - Gửi email thông báo hủy đơn cho khách hàng.

---

## 4. PHÂN HỆ QUẢN TRỊ (ADMINISTRATIVE & SYSTEM OPERATIONS)

Phân hệ dành riêng cho chủ cửa hàng (ADMIN) và nhân viên nghiệp vụ (SALE) để quản trị toàn bộ hoạt động kinh doanh.

### 4.1 Quản lý Sản phẩm nâng cao (Product Management)

#### A. Thiết lập thuộc tính danh mục động (Dynamic Category Attributes)
Để hệ thống linh hoạt, ADMIN có quyền cấu hình các bộ lọc thuộc tính tương ứng với từng danh mục hàng hóa tại bảng Category (Lưu trữ dạng cấu trúc JSONB trong DB):
- **Ví dụ cấu hình:** Danh mục cha "Quần thời trang" có cấu trúc JSONB thuộc tính:
  ```json
  [
    {"name": "Chất liệu", "type": "select", "options": ["Kaki", "Jeans", "Thun", "Cotton"]},
    {"name": "Độ tuổi phù hợp", "type": "select", "options": ["Sơ sinh", "1-3 tuổi", "4-7 tuổi"]}
  ]
  ```
- Khi tạo sản phẩm mới và chọn danh mục này, admin sẽ có các trường input tương ứng để điền giá trị. Dữ liệu này được lưu trữ trong bảng Product để làm bộ lọc thông minh ở trang Storefront.

#### B. Trình tạo ma trận biến thể (Variant Matrix Generator)
Khi nhập sản phẩm thời trang có nhiều kích cỡ và màu sắc, hệ thống tự động sinh ma trận để admin đỡ mất công gõ tay từng dòng:
1. Admin tạo các Option Type (Ví dụ: "Màu sắc", "Kích cỡ").
2. Nhập các Option Value tương ứng:
   - Màu sắc: `[Xanh mint, Hồng pastel]`
   - Kích cỡ: `[1 Tuổi, 2 Tuổi]`
3. Frontend sử dụng thuật toán tích Descartes (Cartesian Product) để tự động sinh ra ma trận 4 dòng biến thể:
   - *Dòng 1:* Xanh mint - 1 Tuổi.
   - *Dòng 2:* Xanh mint - 2 Tuổi.
   - *Dòng 3:* Hồng pastel - 1 Tuổi.
   - *Dòng 4:* Hồng pastel - 2 Tuổi.
4. Giao diện hiển thị bảng ma trận này cho phép nhập hàng loạt:
   - Ô nhập chung (ví dụ: gõ "Giá: 150k, Tồn kho: 50" -> áp dụng cho cả 4 biến thể).
   - Ô chỉnh sửa riêng biệt cho từng biến thể cụ thể (Ví dụ: Biến thể Xanh mint - 1 Tuổi giá 160k do vải đắt hơn, hoặc hết hàng thì nhập Tồn kho = 0).

---

### 4.2 Nhập dữ liệu hàng loạt từ file Excel (Excel Batch Import)

Quy trình import hàng trăm sản phẩm cùng lúc để chuẩn bị cho mùa vụ mới:

1. **Tải file Template mẫu:** Admin bấm nút "Tải file mẫu Excel". Hệ thống xuất ra 1 file `.xlsx` gồm các cột được định nghĩa sẵn:
   - `Tên sản phẩm` (Bắt buộc)
   - `Mã SKU gốc` (Bắt buộc)
   - `Danh mục` (Tên danh mục phải khớp với cây danh mục hiện tại)
   - `Giá bán lẻ` (Số, bắt buộc)
   - `Giá khuyến mãi` (Số, tùy chọn)
   - `Tồn kho ban đầu` (Số, bắt buộc)
   - `Màu sắc` (Ngăn cách bằng dấu phẩy)
   - `Kích cỡ` (Ngăn cách bằng dấu phẩy)
   - `Mô tả sản phẩm` (Văn bản)
2. **Đọc và Validate file trên Backend:**
   - Admin upload file đã điền dữ liệu lên.
   - Backend sử dụng thư viện `exceljs` để phân tích file Excel thành mảng dữ liệu.
   - Thực hiện kiểm tra lỗi nghiêm ngặt (Validate Row-by-Row):
     - Dòng nào thiếu thông tin bắt buộc?
     - Tên Danh mục có khớp với cơ sở dữ liệu không?
     - Định dạng số của cột giá và tồn kho có hợp lệ không?
     - SKU có bị trùng lặp với sản phẩm hiện có không?
3. **Phản hồi kết quả trực quan trên UI:**
   - Hệ thống không ghi vào DB ngay nếu có lỗi, mà trả về báo cáo kết quả chi tiết hiển thị trên giao diện dưới dạng danh sách:
     - "✅ File hợp lệ: 98/100 dòng sẵn sàng nhập."
     - "❌ Lỗi dòng 14: Tên danh mục 'Đồ chơi' không tồn tại trên hệ thống."
     - "❌ Lỗi dòng 45: Giá bán lẻ phải là một số dương hợp lệ."
   - Bấm nút "Xác nhận nhập" -> Backend ghi toàn bộ dữ liệu hợp lệ vào DB trong một single transaction, tự động đồng bộ tồn kho lên Redis.

---

### 4.3 Quản lý Tài khoản & Kiểm soát Hoạt động Nhân sự

#### A. Cấp quyền nhân viên (Staff Management)
- Chỉ tài khoản có `Role = ADMIN` mới có quyền truy cập module này.
- ADMIN tạo tài khoản cho nhân viên SALE bằng cách cung cấp Tên, Email, SĐT và Mật khẩu khởi tạo. Mật khẩu được hash an toàn bằng `bcrypt` trước khi lưu.
- ADMIN có quyền xem danh sách nhân viên, thay đổi trạng thái tài khoản (`isActive = true/false`), hoặc thay đổi mật khẩu của nhân viên trong trường hợp nhân viên quên.

#### B. Ngắt phiên làm việc tức thời (Force Logout via Blacklist)
Trong trường hợp nhân viên nghỉ việc hoặc nghi ngờ tài khoản bị lộ thông tin, ADMIN cần thu hồi quyền truy cập ngay lập tức:
1. ADMIN bấm nút "Khóa tài khoản" (Deactivate) của nhân viên đó.
2. Backend thực hiện:
   - Đặt `isActive = false` cho User đó trong cơ sở dữ liệu PostgreSQL.
   - Tìm kiếm tất cả bản ghi Refresh Token đang hoạt động của User đó trong bảng `RefreshToken`.
   - Lấy giá trị định danh token (`jti` - JWT ID) của các token này.
   - Đẩy các `jti` này vào Redis Blacklist với thời gian sống (TTL) bằng chính thời gian còn hạn của token.
3. Khi nhân viên đó thực hiện bất kỳ request API nào tiếp theo:
   - NestJS Guard chặn request, giải mã Access Token, lấy ra `jti`.
   - Tra cứu trong Redis: Nếu `jti` nằm trong Blacklist, hoặc tra DB thấy tài khoản đã bị khóa (`isActive === false`) -> Ngay lập tức từ chối và trả về mã lỗi `401 Unauthorized` / `403 Forbidden`.
   - Nhân viên bị đẩy ra màn hình đăng nhập ngay lập tức.

#### C. Nhật ký thao tác (Audit Log)
Để phục vụ việc giám sát hoạt động và quy trách nhiệm khi xảy ra sai sót dữ liệu:
- Mọi hoạt động Thêm, Sửa, Xóa (CUD) dữ liệu của nhân viên SALE hoặc ADMIN trên các thực thể quan trọng (Sản phẩm, Đơn hàng, Voucher, Khách hàng) đều phải được hệ thống tự động ghi lại.
- **Dữ liệu log bao gồm:**
  - `userId`: Ai thực hiện thao tác.
  - `action`: Hành động là gì (`CREATE`, `UPDATE` hay `DELETE`).
  - `entity`: Thực thể bị tác động (Ví dụ: `Product`).
  - `entityId`: ID của bản ghi bị tác động.
  - `before`: Ảnh chụp dữ liệu (JSON) của bản ghi trước khi thay đổi (chỉ có khi UPDATE/DELETE).
  - `after`: Ảnh chụp dữ liệu (JSON) của bản ghi sau khi thay đổi (chỉ có khi CREATE/UPDATE).
  - `ipAddress`: IP thiết bị thực hiện thao tác để xác minh vị trí.
- Giao diện xem Audit Log chỉ dành riêng cho ADMIN, hỗ trợ tìm kiếm theo tên nhân viên, khoảng thời gian và tên sản phẩm/mã đơn hàng bị tác động.

---

### 4.4 Quản lý Cấu hình Website & Footer (Master Settings)

Để tránh hardcode thông tin giao diện và cho phép ADMIN toàn quyền tùy biến cửa hàng:

#### A. Cấu hình hệ thống (System Settings)
- **Nghiệp vụ:** ADMIN có giao diện cập nhật thông tin chung bao gồm:
  - Thông tin thương hiệu: Tên shop, Logo (Upload lên MinIO/Cloudinary), Favicon.
  - Thông tin liên hệ: Hotline, Email hỗ trợ, Địa chỉ hiển thị trên Header/Footer và trang Liên hệ.
  - Liên kết mạng xã hội: Facebook, Instagram, Twitter, Github, Youtube.
  - Cấu hình phí ship: Phí ship mặc định (`shippingFeeDefault`) và Ngưỡng miễn phí ship (`freeShippingThreshold`).
  - Thời gian giữ hàng đơn pending chuyển khoản (`orderExpiryHours`).
- **Luồng hoạt động:** 
  1. Khi client (Storefront) load trang lần đầu, gọi API `GET /api/settings` (được cache ở Redis) để lấy cấu hình render toàn bộ header, footer, logo, hotline, và phí ship động.
  2. Khi ADMIN cập nhật thông tin qua `PATCH /api/admin/settings`, hệ thống xóa cache settings trên Redis để đảm bảo người dùng nhận được thông tin mới nhất ngay lập tức.

#### B. Cấu hình chân trang động (Dynamic Footer Columns & Links)
- **Thiết lập cột (FooterColumn):** ADMIN có thể tạo mới, đổi tên hoặc thay đổi thứ tự hiển thị (`sortOrder`) của các cột ở footer (VD: "COMPANY", "HELP", "FAQ").
- **Thiết lập liên kết (FooterLink):** Trong từng cột, ADMIN có thể thêm các link con, gán nhãn hiển thị (Label) và đường dẫn liên kết (URL). Đường dẫn có thể là link nội bộ (như `/about`, `/contact`) hoặc link ngoài (như `https://facebook.com`).
- **Bật/tắt trạng thái:** Cả Column và Link con đều hỗ trợ thuộc tính `isActive`. Khi tắt, link hoặc cột đó lập tức ẩn khỏi giao diện khách hàng mà không cần xóa dữ liệu.
- **Cache:** Tương tự như System Settings, danh sách cột và link footer được cache tại Redis và giải phóng cache (purge cache) mỗi khi có hành động CUD từ phía quản trị viên.
