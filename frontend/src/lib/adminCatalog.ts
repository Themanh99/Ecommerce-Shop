import api from './api';
import type { BannerItem, CategoryNode, ProductCardItem, StorefrontTag } from './storefront';

export type AdminCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
};

export type AdminTagInput = {
  name: string;
  slug: string;
  color?: string;
};

export type AdminBannerInput = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminProductInput = {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  material?: string;
  careInstruction?: string;
  sizeChartUrl?: string;
  categoryId: string;
  tagIds?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean; sortOrder?: number }>;
  optionTypes: Array<{
    name: string;
    displayName?: string;
    sortOrder?: number;
    values: Array<{ value: string; displayValue?: string; sortOrder?: number }>;
  }>;
  variants: Array<{
    sku: string;
    price: number;
    comparePrice?: number;
    stock: number;
    imageUrl?: string;
    isActive?: boolean;
    options: Array<{ optionTypeName: string; value: string }>;
  }>;
};

export type AdminProductList = {
  items: ProductCardItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const adminCatalogApi = {
  categories: () =>
    api.get<CategoryNode[]>('/admin/catalog/categories').then((response) => response.data),
  createCategory: (payload: AdminCategoryInput) =>
    api.post<CategoryNode>('/admin/catalog/categories', payload).then((response) => response.data),
  updateCategory: (id: string, payload: Partial<AdminCategoryInput>) =>
    api
      .patch<CategoryNode>(`/admin/catalog/categories/${id}`, payload)
      .then((response) => response.data),

  tags: () => api.get<StorefrontTag[]>('/admin/catalog/tags').then((response) => response.data),
  createTag: (payload: AdminTagInput) =>
    api.post<StorefrontTag>('/admin/catalog/tags', payload).then((response) => response.data),

  banners: () =>
    api.get<BannerItem[]>('/admin/catalog/banners').then((response) => response.data),
  createBanner: (payload: AdminBannerInput) =>
    api.post<BannerItem>('/admin/catalog/banners', payload).then((response) => response.data),

  products: () =>
    api
      .get<AdminProductList>('/admin/catalog/products', { params: { limit: 20 } })
      .then((response) => response.data),
  createProduct: (payload: AdminProductInput) =>
    api.post('/admin/catalog/products', payload).then((response) => response.data),
};
