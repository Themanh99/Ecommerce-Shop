/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ProductCardItem } from '@/lib/storefront';
import { formatPrice, productPlaceholder } from '@/lib/storefront';

type ProductCardProps = {
  product: ProductCardItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.primaryImage || productPlaceholder;
  const ratingText =
    product.reviewCount > 0
      ? `${product.ratingAverage.toFixed(1)}/5 (${product.reviewCount})`
      : 'Chưa có đánh giá';

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-image" aria-label={product.name}>
        <img src={image} alt={product.name} loading="lazy" />
        <div className="product-badges">
          {product.isNew && <span className="product-badge">Mới</span>}
          {product.discountPercent > 0 && (
            <span className="product-badge product-badge-sale">-{product.discountPercent}%</span>
          )}
          {product.isSoldOut && <span className="product-badge product-badge-muted">Hết hàng</span>}
        </div>
      </Link>
      <Link className="product-name" href={`/product/${product.slug}`}>
        {product.name}
      </Link>
      <div className="product-rating">
        <span className="stars">★★★★★</span>
        <span>{ratingText}</span>
      </div>
      <div className="product-price">
        <strong>{formatPrice(product.priceMin)}</strong>
        {product.comparePriceMin && product.comparePriceMin > product.priceMin ? (
          <span className="old-price">{formatPrice(product.comparePriceMin)}</span>
        ) : null}
      </div>
    </article>
  );
}
