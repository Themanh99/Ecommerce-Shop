# Module 04: Quản trị Sản phẩm & Danh mục (Admin Product)

## 1. Tổng quan
- **Mục tiêu:** Nơi người quản trị điều hành dữ liệu lõi của cửa hàng: thêm, sửa, xóa sản phẩm, danh mục và quản lý hàng tồn.
- **Actor:** Role `Admin` và `Sale`.
- **UI Components:** Ant Design (Table, Form linh động, Upload kéo thả, Modal, Select).

## 2. Quản lý Danh mục (Category Management)
### A. Logic thuộc tính động (Dynamic Attributes - Core Architecture)
- **Tính năng cực kỳ quan trọng:** Không fix cứng CSDL. 
  - Nếu tạo Danh mục `"Điện thoại"`, Admin định nghĩa các thuộc tính gắn liền: `[RAM, Bộ nhớ, Vi xử lý]`.
  - Nếu tạo Danh mục `"Quần áo"`, Admin định nghĩa: `[Size, Màu sắc, Chất liệu]`.
- Database sẽ lưu các Options này dưới dạng trường `JSONB` trong bảng Category, gắn chặt vòng đời sản phẩm với Danh mục nhằm mở rộng E-commerce vĩnh viễn sau này.

## 3. Màn hình Quản lý Sản phẩm (Product CRUD)
### A. Giao diện Bảng dữ liệu (Data Table)
```text
[ Nút (Primary): + Thêm SP Mới ]  [ Nút (Ghost): Import SP từ Excel ]
----------------------------------------------------------------------------------
| Lọc Danh mục v | Lọc Trạng thái v | [  Tìm kiếm SP theo tên hoặc ID...       ] |
----------------------------------------------------------------------------------
| [Ảnh] | Tên Sản phẩm    | Danh mục | Số Option | Tồn kho tổng | Hành động        |
| [img] | Áo thun Polo    | Áo Nam   | 3 Biến thể| 150 cái      | [Sửa(icon)][Xóa] |
| [img] | Quần Jeans Rách | Quần Nam | 2 Biến thể| 0 (Hết hàng) | [Sửa(icon)][Xóa] |
| [img] | Nón Sơn Cap     | Phụ kiện | 1 (Đơn)   | 55 cái       | [Sửa(icon)][Xóa] |
----------------------------------------------------------------------------------
```

### B. Màn hình Thêm/Sửa Sản phẩm (Create/Update Form)
Chia Form ra làm nhiều Tab hoặc Block Collapse dài để giao diện thoáng đãng.
- **Block 1: Thông tin cơ bản:** 
  - Tên SP.
  - Mô tả chi tiết (Sử dụng hộp thoại Rich Text như `React-Quill` hoặc `TinyMCE` để gõ in đậm, in nghiêng).
- **Block 2: Hình ảnh sản phẩm:**
  - Kéo thả nhiều ảnh cùng lúc bằng component `Upload` của AntD.
  - Khi thả file, Frontend gọi API upload thẳng lên **Cloudinary** (Trả về Array chứa các chuỗi URL ảnh) và đính kèm vào Form.
- **Block 3: Biến thể (Variants) & Tồn kho:**
  - Nếu sản phẩm "Đơn giản" (Ví dụ: Nón Freesize): Cấp 1 ô nhập `Giá bán gốc`, `Giá Sale`, và `Số lượng tồn kho`.
  - Nếu sản phẩm "Nhiều biến thể": 
    - Thêm Option 1: "Màu Sắc" -> Values `[Đỏ, Đen]`.
    - Thêm Option 2: "Size" -> Values `[L, XL]`.
    - **Frontend tự động Generate Bảng Ma trận (Matrix):**
      - `[Đỏ] - [L]` -> Ô nhập Giá: ___, Giá Sale: ___, Tồn kho: ___ cái.
      - `[Đỏ] - [XL]` -> Ô nhập Giá: ___, Giá Sale: ___, Tồn kho: ___ cái.
      - `[Đen] - [L]` -> ...

## 4. Tính năng Import Sản phẩm (Mass Excel Upload)
Tính năng hỗ trợ nhập dữ liệu cực nhanh cho bài toán thực tế.
- **Action:** Trỏ chuột vào nút "Import Excel" -> Hiện Tooltip hướng dẫn "Tải file Template gốc để điền".
- **Workflow:** 
  1. Admin nhấn tải file mẫu `.xlsx`.
  2. Điền thông tin hàng trăm SP theo cột (Tên, Giá, Link Ản URL, Tồn kho). 
  3. Chọn file tải lên web -> Frontend / Backend phân tích file (Dùng thư viện Nodejs Excel).
  4. Backend chạy Validations từng dòng.
  5. Trả về kết quả đẹp trên UI Card: "✅ Đã thêm thành công 150 SP. ❌ 2 SP lỗi nhập do thiếu Giá tiền ở dòng 3 và dòng 4".
