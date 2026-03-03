# Module 02: Giao diện Khách hàng & Sản phẩm (Storefront)

## 1. Tổng quan
- **Mục tiêu:** Nơi người dùng tiếp cận sản phẩm, hỗ trợ tìm kiếm, bộ lọc nâng cao và xem chi tiết sản phẩm.
- **Actor:** Mọi người dùng (Khách vãng lai và Tài khoản khách hàng).
- **UI Components:** Ant Design (Card, Carousel, Pagination, Select, Tabs, Affix).

## 2. Trang chủ (Home Page)
Trang chủ tập trung vào Banner quảng bá và phân mảng các sản phẩm tiêu biểu để kích thích mua sắm.

### A. Giao diện (Mockup)
```text
[ Header: Logo | Search Bar | Categories | User ] [ Cart (3) ]
--------------------------------------------------------------
[ Banner Slider / Carousel (Hiển thị các chương trình Sale)  ]
--------------------------------------------------------------
Danh mục nổi bật:
( Hình tròn: Áo nam )  ( Hình tròn: Quần nam ) ( Phụ kiện )
--------------------------------------------------------------
🔥 HOT SALE TUẦN NÀY
[ Product Card  ] [ Product Card  ] [ Product Card  ]
--------------------------------------------------------------
✨ SẢN PHẨM MỚI NHẤT
[ Product Card  ] [ Product Card  ] [ Product Card  ]
```

### B. Product Card Component (Thẻ Sản Phẩm)
- `Hình ảnh (Thumb)`:
  - Có Overlay khi trỏ chuột (Hover): Hiện ra 2 nút: `Xem Nhanh (Quick View)` và `Thêm Giỏ Hàng`.
  - Có góc Tag (Badge) ghi "Giảm 20%" hoặc "MỚI" hoặc dấu chéo "Hết hàng".
- `Tên Sản phẩm`: Giới hạn hiển thị 2 dòng chữ (Ellipsis).
- `Giá tiền`: Hiển thị giá đang bán và chữ mờ gạch ngang giá gốc.

## 3. Trang Danh sách Tìm kiếm / Bộ lọc (Product Listing)
Trang này xuất hiện khi khách nhấn vào 1 Danh mục, hoặc gõ từ khóa tìm kiếm.

### A. Giao diện (Mockup)
```text
[ Breadcrumb: Trang chủ / Kết quả tìm kiếm cho "Áo thun polo" ]
--------------------------------------------------------------
| BỘ LỌC TÌM KIẾM  |  [ Xắp xếp theo: Giá Tăng dần v ]       |
|                  |                                         |
| [ ] Size S       |  [ Card ] [ Card ] [ Card ] [ Card ]    |
| [ ] Size M       |  [ Card ] [ Card ] [ Card ] [ Card ]    |
|                  |  [ Card ] [ Card ] [ Card ] [ Card ]    |
| [ ] Màu Đen      |                                         |
| [ ] Màu Trắng    |                                         |
|                  |      <<  1  [2]  3  4  5  >>            |
| [ ] Giá < 500k   |                                         |
| [ ] Chỉ hiện còn |                                         |
--------------------------------------------------------------
```
### B. Logic hoạt động (Actions & API)
- **Cơ chế lọc động (Dynamic Search):**
  - Mọi thay đổi của Checkbox/Select phải cập nhật ngay lập tức lên URL (ví dụ: `?q=ao&size=M&color=Den`).
  - Giao diện Product List sẽ vào chế độ mờ đi (Skeleton Loading) trong tích tắc chờ API Backend trả về (React Query tự động handle cache và fetch data).
  - API call (tưởng tượng): `GET /api/products?sizes=S,M&maxPrice=500000`

## 4. Trang Chi tiết Sản phẩm (Product Detail)
Trang quan trọng nhất, nơi diễn ra quyết định mua hàng.

### A. Giao diện (Mockup)
```text
[ Breadcrumb: Trang chủ / Áo nam / Áo thun Polo ABC ]
--------------------------------------------------------------
|                  | Áo thun Polo nam ABC cao cấp            |
|  [ Ảnh To Zoom]  | * * * * * (4.5) | 120 Đánh giá          |
|                  | --------------------------------------- |
| [ Ảnh 1][Ảnh 2]  | Giá: 250.000đ  (Gốc: 350.000đ)          |
|                  | Màu sắc: [Đỏ] [Đen] [Trắng] *(Chọn 1)*  |
|                  | Kích thước (Size): [S] [L (Hết)] [XL]   |
|                  | --------------------------------------- |
|                  | Chọn số lượng: [ - 1 + ]  (Còn: 13 áo)  |
|                  | [ Nút: Thêm vào giỏ ] [ Nút: Mua ngay ] |
--------------------------------------------------------------
[ Tabs: Đặc điểm Nổi bật | Chi tiết Kích cỡ (Size Chart) ]
[ Bài viết mô tả chi tiết Sản phẩm (HTML / Rich Text) ]
--------------------------------------------------------------
[ Tabs: Đánh giá & Bình luận (Review) ]
- Reviewer 1: Áo đẹp, giao nhanh!
- Reviewer 2: Vải hơi nóng (3 sao)
```
### B. Logic Trạng thái (Variants)
- **Tương tác Chọn Biến thể (Size/Color):**
  - Nếu chọn màu Đen, Size XL -> API hoặc Frontend Map sẽ soi ra "Biến thể" này có giá là tiền nào, và số lượng Tồn Kho là bao nhiêu.
  - Hình "Ảnh To Zoom" tự động chuyển sang cái áo màu Đen. 
  - Nếu số lượng Tồn Kho = 0, Disable nút "Thêm vào giỏ" và hiện chữ "Đã bán hết option này".
- **Action: "Thêm vào giỏ" / "Mua ngay":**
  - Validation: Cảnh báo đỏ (Toast Error) nếu người dùng quên chọn Size hoặc Màu mà đã bấm Thêm vào Giỏ.
  - Sau khi thêm -> Giỏ hàng chớp sáng, popup Thông báo bay ra: "Đã thêm 1 Áo Polo vào giỏ!". Nút "Mua ngay" sẽ dẫn thẳng sang màn Checkout.
