'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckOutlined, RightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import { formatPrice, products, reviews, type Product } from '@/data/store';

export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState('Large');

  return (
    <main>
      <AppHeader />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <RightOutlined />
          <Link href="/shop">Shop</Link>
          <RightOutlined />
          <span>{product.category}</span>
        </div>

        <section className="product-detail">
          <div className="product-gallery">
            {[0, 1, 2].map((item) => (
              <div className="gallery-thumb" key={item}>
                <Image
                  src={product.image}
                  alt={`${product.name} view ${item + 1}`}
                  fill
                  sizes="120px"
                  style={{
                    objectPosition: item === 0 ? 'center' : item === 1 ? '40% center' : '60% center',
                  }}
                />
              </div>
            ))}
            <div className="gallery-main">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </div>
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-rating detail-rating">
              <span className="stars">★★★★★</span>
              <span>{product.rating}/5</span>
            </div>
            <div className="product-price detail-price">
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice ? <del>{formatPrice(product.oldPrice)}</del> : null}
              {product.discount ? <span>-{product.discount}%</span> : null}
            </div>
            <p className="product-copy">
              This graphic t-shirt is perfect for any occasion. Crafted from a
              soft and breathable fabric, it offers superior comfort and style
              throughout the day.
            </p>

            <div className="choice-group">
              <p>Select Colors</p>
              <div className="choice-colors">
                {product.colors.map((item) => (
                  <button
                    className={`color-dot ${color === item ? 'active' : ''}`}
                    key={item}
                    style={{ background: item }}
                    onClick={() => setColor(item)}
                    aria-label={`Select color ${item}`}
                  >
                    {color === item ? <CheckOutlined style={{ color: '#fff' }} /> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="choice-group">
              <p>Choose Size</p>
              <div className="choice-sizes">
                {['Small', 'Medium', 'Large', 'X-Large'].map((item) => (
                  <button
                    className={`pill ${size === item ? 'active' : ''}`}
                    onClick={() => setSize(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="add-row">
              <div className="quantity">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <strong>{quantity}</strong>
                <button onClick={() => setQuantity((value) => value + 1)}>+</button>
              </div>
              <Link href="/cart" className="button button-dark">
                Add to Cart
              </Link>
            </div>
          </div>
        </section>

        <section className="detail-reviews">
          <div className="tabs">
            <button>Product Details</button>
            <button className="active">Rating & Reviews</button>
            <button>FAQs</button>
          </div>
          <div className="section-heading review-heading">
            <h2>All Reviews</h2>
            <span>({reviews.length * 150})</span>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="stars">★★★★★</div>
                <h3>
                  {review.name} <span className="verified">✓</span>
                </h3>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>

          <div className="section product-section">
            <div className="section-heading">
              <h2>You might also like</h2>
            </div>
            <div className="product-grid">
              {products.slice(1, 5).map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <AppFooter />
    </main>
  );
}
