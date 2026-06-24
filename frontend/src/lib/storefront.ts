import api from './api';

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
  children: CategoryNode[];
};

export type BannerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  position: string;
};

export type StorefrontTag = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
};

export type ProductCardItem = {
  id: string;
  slug: string;
  name: string;
  category?: CategoryNode | null;
  tags: StorefrontTag[];
  primaryImage?: string | null;
  priceMin: number;
  comparePriceMin?: number | null;
  discountPercent: number;
  isNew: boolean;
  isSoldOut: boolean;
  ratingAverage: number;
  reviewCount: number;
};

export type StorefrontHome = {
  banners: BannerItem[];
  featuredCategories: CategoryNode[];
  bestSellers: ProductCardItem[];
  newArrivals: ProductCardItem[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  stockAvailable: number;
  image?: string | null;
  options: Array<{
    id: string;
    value: string;
    displayValue?: string | null;
    optionType: {
      id: string;
      name: string;
      displayName?: string | null;
    };
  }>;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  material?: string | null;
  careInstruction?: string | null;
  sizeChartUrl?: string | null;
  category?: CategoryNode | null;
  tags: StorefrontTag[];
  gallery: Array<{
    id: string;
    url: string;
    alt?: string | null;
    isPrimary: boolean;
  }>;
  optionTypes: Array<{
    id: string;
    name: string;
    displayName?: string | null;
    values: Array<{ id: string; value: string; displayValue?: string | null }>;
  }>;
  variants: ProductVariant[];
  stockAvailable: number;
  ratingAverage: number;
  reviewCount: number;
};

export type StorefrontReview = {
  id: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  userName: string;
  createdAt: string;
};

export type ProductFilters = {
  categories: CategoryNode[];
  tags: StorefrontTag[];
  sizes: string[];
  colors: string[];
  priceRange: { min: number; max: number };
};

export type PaginatedProducts = {
  items: ProductCardItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductListQuery = {
  q?: string;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_seller';
  page?: number;
  limit?: number;
};

export const productPlaceholder = '/images/store/hero-kids-fashion.svg';

export function formatPrice(value?: number | null) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export const storefrontApi = {
  home: () => api.get<StorefrontHome>('/storefront/home').then((response) => response.data),
  categories: () =>
    api.get<CategoryNode[]>('/storefront/categories').then((response) => response.data),
  filters: () =>
    api.get<ProductFilters>('/storefront/products/filters').then((response) => response.data),
  products: (params: ProductListQuery) =>
    api
      .get<PaginatedProducts>('/storefront/products', { params })
      .then((response) => response.data),
  product: (slug: string) =>
    api.get<ProductDetail>(`/storefront/products/${slug}`).then((response) => response.data),
  reviews: (slug: string) =>
    api
      .get<StorefrontReview[]>(`/storefront/products/${slug}/reviews`)
      .then((response) => response.data),
};
