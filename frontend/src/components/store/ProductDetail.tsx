'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { App, Empty } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { formatPrice, productPlaceholder, storefrontApi } from '@/lib/storefront';

export function ProductDetail({ slug }: { slug: string }) {
  const { message } = App.useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ['storefront-product', slug],
    queryFn: () => storefrontApi.product(slug),
    retry: false,
  });
  const reviewsQuery = useQuery({
    queryKey: ['storefront-product-reviews', slug],
    queryFn: () => storefrontApi.reviews(slug),
    retry: false,
  });

  const product = productQuery.data;
  const gallery = product?.gallery.length ? product.gallery : [];
  const mainImage =
    activeImage ||
    gallery.find((image) => image.isPrimary)?.url ||
    gallery[0]?.url ||
    product?.variants.find((variant) => variant.image)?.image ||
    productPlaceholder;

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    const selectedCount = Object.keys(selectedOptions).length;
    if (selectedCount < product.optionTypes.length) return null;
    return (
      product.variants.find((variant) =>
        variant.options.every(
          (option) => selectedOptions[option.optionType.id] === option.value,
        ),
      ) ?? null
    );
  }, [product, selectedOptions]);

  if (productQuery.isLoading) {
    return (
      <main>
        <AppHeader />
        <div className="container empty-state">Đang tải sản phẩm MoonKid...</div>
        <AppFooter />
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <AppHeader />
        <div className="container empty-state">
          <Empty description="Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng bán." />
          <Link className="button button-dark" href="/shop">
            Quay lại cửa hàng
          </Link>
        </div>
        <AppFooter />
      </main>
    );
  }

  const visiblePrice = selectedVariant?.price ?? Math.min(...product.variants.map((item) => item.price));
  const comparePrice = selectedVariant?.comparePrice;
  const canAddToCart = Boolean(selectedVariant && selectedVariant.stockAvailable > 0);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      message.warning('Ba mẹ chọn đủ phân loại trước nhé.');
      return;
    }
    if (selectedVariant.stockAvailable <= 0) {
      message.error('Phân loại này đang hết hàng.');
      return;
    }
    message.success('Đã ghi nhận lựa chọn. Giỏ hàng API sẽ được nối ở phase sau.');
  };

  return (
    <main>
      <AppHeader />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link>
          <RightOutlined />
          <Link href="/shop">Sản phẩm</Link>
          <RightOutlined />
          <span>{product.category?.name || product.name}</span>
        </div>

        <section className="product-detail">
          <div className="product-gallery">
            {(gallery.length ? gallery : [{ id: 'placeholder', url: productPlaceholder, alt: product.name }]).map(
              (item) => (
                <button
                  className="gallery-thumb"
                  key={item.id}
                  onClick={() => setActiveImage(item.url)}
                  aria-label={`Xem ảnh ${item.alt || product.name}`}
                >
                  <img src={item.url} alt={item.alt || product.name} />
                </button>
              ),
            )}
            <div className="gallery-main">
              <img src={mainImage} alt={product.name} />
            </div>
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-rating detail-rating">
              <span className="stars">★★★★★</span>
              <span>
                {product.reviewCount > 0
                  ? `${product.ratingAverage}/5 (${product.reviewCount} đánh giá)`
                  : 'Chưa có đánh giá'}
              </span>
            </div>
            <div className="product-price detail-price">
              <strong>{formatPrice(visiblePrice)}</strong>
              {comparePrice && comparePrice > visiblePrice ? <del>{formatPrice(comparePrice)}</del> : null}
            </div>
            <p className="product-copy">
              {product.shortDescription ||
                product.description ||
                'Thiết kế dành riêng cho làn da nhạy cảm của bé, ưu tiên chất liệu mềm mại, thoáng khí và thuận tiện vận động suốt ngày dài.'}
            </p>

            {product.optionTypes.map((optionType) => (
              <div className="choice-group" key={optionType.id}>
                <p>Chọn {optionType.displayName || optionType.name}</p>
                <div className="choice-sizes">
                  {optionType.values.map((value) => (
                    <button
                      className={`pill ${
                        selectedOptions[optionType.id] === value.value ? 'active' : ''
                      }`}
                      onClick={() =>
                        setSelectedOptions((current) => ({
                          ...current,
                          [optionType.id]: value.value,
                        }))
                      }
                      key={value.id}
                    >
                      {value.displayValue || value.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="stock-note">
              {selectedVariant
                ? selectedVariant.stockAvailable > 0
                  ? `Còn ${selectedVariant.stockAvailable} sản phẩm`
                  : 'Phân loại này đã hết hàng'
                : 'Chọn phân loại để xem tồn kho'}
            </div>

            <div className="add-row">
              <div className="quantity">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <strong>{quantity}</strong>
                <button onClick={() => setQuantity((value) => value + 1)}>+</button>
              </div>
              <button className="button button-dark" disabled={!canAddToCart} onClick={handleAddToCart}>
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </section>

        <section className="detail-reviews">
          <div className="tabs">
            <button className="active">Thông tin sản phẩm</button>
            <button>Đánh giá</button>
          </div>
          <div className="product-extra">
            {product.material && <p><strong>Chất liệu:</strong> {product.material}</p>}
            {product.careInstruction && <p><strong>Bảo quản:</strong> {product.careInstruction}</p>}
            {product.sizeChartUrl && (
              <p>
                <Link href={product.sizeChartUrl} target="_blank">
                  Xem bảng size
                </Link>
              </p>
            )}
          </div>
          <div className="section-heading review-heading">
            <h2>Đánh giá đã duyệt</h2>
            <span>({reviewsQuery.data?.length ?? 0})</span>
          </div>
          {reviewsQuery.data?.length ? (
            <div className="review-grid">
              {reviewsQuery.data.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="stars">{'★'.repeat(review.rating)}</div>
                  <h3>
                    {review.userName} <span className="verified">✓</span>
                  </h3>
                  <p>“{review.content || review.title || 'Ba mẹ đã đánh giá sản phẩm này.'}”</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">Sản phẩm chưa có đánh giá được duyệt.</div>
          )}
        </section>
      </div>
      <AppFooter />
    </main>
  );
}
