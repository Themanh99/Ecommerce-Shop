export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  discount?: number;
  image: string;
  colors: string[];
};

export const products: Product[] = [
  {
    id: 'ao-thun-cau-vong',
    name: 'Áo thun cầu vồng cho bé',
    category: 'Áo thun',
    price: 189000,
    rating: 4.5,
    image: '/images/store/product-placeholder.svg',
    colors: ['#4f4631', '#314f4a', '#263447'],
  },
  {
    id: 'ao-polo-phoi-vien',
    name: 'Áo polo phối viền năng động',
    category: 'Áo polo',
    price: 229000,
    rating: 4.5,
    image: '/images/store/product-placeholder.svg',
    colors: ['#9f5868', '#40566f', '#f0e5d1'],
  },
  {
    id: 'ao-thun-ke-soc',
    name: 'Áo thun kẻ sọc mềm mại',
    category: 'Áo thun',
    price: 159000,
    oldPrice: 199000,
    rating: 5,
    discount: 20,
    image: '/images/store/product-placeholder.svg',
    colors: ['#151515', '#e7e7e7'],
  },
  {
    id: 'quan-jeans-co-gian',
    name: 'Quần jeans co giãn cho bé',
    category: 'Quần jeans',
    price: 279000,
    oldPrice: 319000,
    rating: 3.5,
    discount: 13,
    image: '/images/store/product-placeholder.svg',
    colors: ['#304c70', '#1e2e43'],
  },
  {
    id: 'so-mi-ke-doc',
    name: 'Sơ mi kẻ dọc thanh lịch',
    category: 'Áo sơ mi',
    price: 259000,
    oldPrice: 299000,
    rating: 5,
    discount: 13,
    image: '/images/store/product-placeholder.svg',
    colors: ['#75806f', '#e9e3d7'],
  },
  {
    id: 'ao-thun-hinh-thu',
    name: 'Áo thun hình thú đáng yêu',
    category: 'Áo thun',
    price: 179000,
    rating: 4,
    image: '/images/store/product-placeholder.svg',
    colors: ['#dd632f', '#e6c6aa'],
  },
  {
    id: 'quan-short-bermuda',
    name: 'Quần short Bermuda thoải mái',
    category: 'Quần short',
    price: 149000,
    rating: 3,
    image: '/images/store/product-placeholder.svg',
    colors: ['#4e6677', '#d1c7b6'],
  },
  {
    id: 'quan-jeans-bac-mau',
    name: 'Quần jeans bạc màu cá tính',
    category: 'Quần jeans',
    price: 299000,
    rating: 4.5,
    image: '/images/store/product-placeholder.svg',
    colors: ['#252525', '#607488'],
  },
  {
    id: 'so-mi-caro',
    name: 'Áo sơ mi caro cho bé',
    category: 'Áo sơ mi',
    price: 239000,
    rating: 4.5,
    image: '/images/store/product-placeholder.svg',
    colors: ['#813c44', '#26334b'],
  },
];

export const reviews = [
  {
    name: 'Chị Minh Anh',
    text: 'Vải mềm, đường may đẹp và bé mặc rất thoải mái. MoonKid tư vấn size cũng rất chuẩn.',
  },
  {
    name: 'Anh Tuấn',
    text: 'Mẫu mã dễ thương, giá hợp lý và giao hàng nhanh. Bé nhà mình rất thích bộ đồ mới.',
  },
  {
    name: 'Chị Ngọc Hà',
    text: 'Đổi size thuận tiện, nhân viên hỗ trợ nhiệt tình. Mình sẽ tiếp tục mua đồ cho hai bé tại đây.',
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
