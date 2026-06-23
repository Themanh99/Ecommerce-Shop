import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/store';
import { formatPrice } from '@/data/store';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.id}`} className="product-image">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 560px) 50vw, (max-width: 1000px) 33vw, 25vw"
        />
      </Link>
      <Link href={`/product/${product.id}`} className="product-name">
        {product.name}
      </Link>
      <div className="product-rating">
        <span className="stars">★★★★★</span>
        <span>{product.rating}/5</span>
      </div>
      <div className="product-price">
        <strong>{formatPrice(product.price)}</strong>
        {product.oldPrice ? <del>{formatPrice(product.oldPrice)}</del> : null}
        {product.discount ? <span>-{product.discount}%</span> : null}
      </div>
    </article>
  );
}
