'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteOutlined, RightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { formatPrice, products } from '@/data/store';

const initialItems = [
  { product: products[0], size: '3–5 tuổi', color: 'Xanh rêu', quantity: 1 },
  { product: products[8], size: '1–2 tuổi', color: 'Đỏ', quantity: 1 },
  { product: products[6], size: '3–5 tuổi', color: 'Xanh dương', quantity: 1 },
];

export function CartView() {
  const [items, setItems] = useState(initialItems);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [items],
  );
  const discount = Math.round(subtotal * 0.2);
  const delivery = items.length ? 15 : 0;
  const total = subtotal - discount + delivery;

  const changeQuantity = (id: string, amount: number) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  };

  return (
    <main>
      <AppHeader />
      <div className="container cart-page">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link>
          <RightOutlined />
          <span>Giỏ hàng</span>
        </div>
        <h1 className="page-title">Giỏ hàng của bạn</h1>

        <div className="cart-grid">
          <section className="cart-items">
            {items.map((item) => (
              <article className="cart-line" key={item.product.id}>
                <div className="cart-product">
                  <div className="cart-image">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="124px"
                    />
                  </div>
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>Kích cỡ: {item.size}</p>
                    <p>Màu sắc: {item.color}</p>
                    <strong>{formatPrice(item.product.price)}</strong>
                  </div>
                </div>
                <div className="cart-controls">
                  <button
                    className="remove-button"
                    aria-label={`Xóa ${item.product.name}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter(
                          (currentItem) =>
                            currentItem.product.id !== item.product.id,
                        ),
                      )
                    }
                  >
                    <DeleteOutlined />
                  </button>
                  <div className="quantity">
                    <button onClick={() => changeQuantity(item.product.id, -1)}>−</button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => changeQuantity(item.product.id, 1)}>+</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="order-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-line">
              <span>Tạm tính</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="summary-line discount">
              <span>Giảm giá (-20%)</span>
              <strong>-{formatPrice(discount)}</strong>
            </div>
            <div className="summary-line">
              <span>Phí giao hàng</span>
              <strong>{formatPrice(delivery)}</strong>
            </div>
            <div className="summary-line summary-total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="promo-row">
              <input placeholder="Nhập mã giảm giá" aria-label="Mã giảm giá" />
              <button className="button button-dark">Áp dụng</button>
            </div>
            <button className="button button-dark checkout-button">
              Tiến hành đặt hàng →
            </button>
          </aside>
        </div>
      </div>
      <AppFooter />
    </main>
  );
}
