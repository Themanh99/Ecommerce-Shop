'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterOutlined, RightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import type { CategoryNode, ProductListQuery } from '@/lib/storefront';
import { formatPrice, storefrontApi } from '@/lib/storefront';

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_seller', label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

export function ShopClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => ({
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      sizes: searchParams.get('sizes') || undefined,
      colors: searchParams.get('colors') || undefined,
      minPrice: toNumber(searchParams.get('minPrice')),
      maxPrice: toNumber(searchParams.get('maxPrice')),
      sort: ((searchParams.get('sort') || 'newest') as ProductListQuery['sort']),
      page: toNumber(searchParams.get('page')) || 1,
      limit: 24,
    }),
    [searchParams],
  );

  const productsQuery = useQuery({
    queryKey: ['storefront-products', query],
    queryFn: () => storefrontApi.products(query),
  });
  const filtersQuery = useQuery({
    queryKey: ['storefront-filters'],
    queryFn: storefrontApi.filters,
  });

  const products = productsQuery.data;
  const filters = filtersQuery.data;
  const pagination = products?.pagination;

  const updateQuery = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!('page' in updates)) {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => router.push('/shop');

  return (
    <main>
      <AppHeader />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link>
          <RightOutlined />
          <span>Thời trang trẻ em</span>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filters-header">
              <h2>Bộ lọc</h2>
              <FilterOutlined />
            </div>

            <div className="filter-group category-list">
              <div className="filter-label">
                <span>Danh mục</span>
                <span>⌃</span>
              </div>
              {filters?.categories.length ? (
                flattenCategories(filters.categories).map((category) => (
                  <button
                    type="button"
                    className={`filter-label filter-button ${
                      query.category === category.slug ? 'active' : ''
                    }`}
                    key={category.id}
                    onClick={() => updateQuery({ category: category.slug })}
                  >
                    <span>{category.name}</span>
                    <RightOutlined />
                  </button>
                ))
              ) : (
                <p className="muted-text">Chưa có danh mục.</p>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Khoảng giá</span>
                <span>⌃</span>
              </div>
              <div className="price-track" />
              <div className="price-values">
                <button onClick={() => updateQuery({ minPrice: undefined, maxPrice: 200000 })}>
                  Dưới 200k
                </button>
                <button onClick={() => updateQuery({ minPrice: 200000, maxPrice: 500000 })}>
                  200k–500k
                </button>
                <button onClick={() => updateQuery({ minPrice: 500000, maxPrice: undefined })}>
                  Trên 500k
                </button>
              </div>
              {filters?.priceRange ? (
                <p className="muted-text">
                  Giá hiện có: {formatPrice(filters.priceRange.min)} –{' '}
                  {formatPrice(filters.priceRange.max)}
                </p>
              ) : null}
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Màu sắc</span>
                <span>⌃</span>
              </div>
              <div className="color-list">
                {filters?.colors.length ? (
                  filters.colors.map((color) => (
                    <button
                      className={`color-chip ${query.colors === color ? 'active' : ''}`}
                      key={color}
                      onClick={() => updateQuery({ colors: color })}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <span className="muted-text">Chưa có màu.</span>
                )}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Kích cỡ</span>
                <span>⌃</span>
              </div>
              <div className="size-list">
                {filters?.sizes.length ? (
                  filters.sizes.map((size) => (
                    <button
                      className={query.sizes === size ? 'pill active' : 'pill'}
                      key={size}
                      onClick={() => updateQuery({ sizes: size })}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="muted-text">Chưa có kích cỡ.</span>
                )}
              </div>
            </div>

            <div className="filter-group category-list">
              <div className="filter-label">
                <span>Nhu cầu / tag</span>
                <span>⌃</span>
              </div>
              {filters?.tags.length ? (
                filters.tags.map((tag) => (
                  <button
                    type="button"
                    className={`filter-label filter-button ${query.tag === tag.slug ? 'active' : ''}`}
                    key={tag.id}
                    onClick={() => updateQuery({ tag: tag.slug })}
                  >
                    <span>{tag.name}</span>
                    <RightOutlined />
                  </button>
                ))
              ) : (
                <p className="muted-text">Chưa có tag.</p>
              )}
            </div>

            <button className="button button-dark filter-apply" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </aside>

          <section>
            <div className="shop-heading">
              <h1 className="page-title">Sản phẩm cho bé</h1>
              <p>
                <span>
                  {productsQuery.isLoading
                    ? 'Đang tải sản phẩm...'
                    : `Tìm thấy ${pagination?.total ?? 0} sản phẩm`}
                </span>{' '}
                <label>
                  Sắp xếp:{' '}
                  <select
                    value={query.sort}
                    onChange={(event) => updateQuery({ sort: event.target.value })}
                  >
                    {sortOptions.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </p>
            </div>

            {products?.items.length ? (
              <div className="product-grid shop-products">
                {products.items.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                {productsQuery.isLoading
                  ? 'Đang tải sản phẩm MoonKid...'
                  : 'Chưa có sản phẩm, vui lòng quay lại sau.'}
              </div>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <nav className="pagination" aria-label="Phân trang sản phẩm">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => updateQuery({ page: pagination.page - 1 })}
                >
                  ←
                </button>
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                  .slice(0, 5)
                  .map((page) => (
                    <button
                      className={pagination.page === page ? 'active' : ''}
                      key={page}
                      onClick={() => updateQuery({ page })}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateQuery({ page: pagination.page + 1 })}
                >
                  →
                </button>
              </nav>
            ) : null}
          </section>
        </div>
      </div>
      <AppFooter />
    </main>
  );
}

function toNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function flattenCategories(categories: CategoryNode[]): CategoryNode[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}
