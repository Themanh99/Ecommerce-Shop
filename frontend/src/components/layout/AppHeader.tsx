'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CloseOutlined,
  MenuOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AuthModal } from '@/features/auth/components/AuthModal';

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div className="announcement">
        Sign up and get 20% off your first order.{' '}
        <button onClick={() => setAuthOpen(true)}>Sign up now</button>
      </div>
      <header className="site-header">
        <div className="container header-row">
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>

          <Link className="logo" href="/">
            SHOP.CO
          </Link>

          <nav className={`main-nav ${menuOpen ? 'main-nav-open' : ''}`}>
            <Link href="/shop">Shop</Link>
            <Link href="/shop?sort=sale">On Sale</Link>
            <Link href="/shop?sort=new">New Arrivals</Link>
            <Link href="/#brands">Brands</Link>
          </nav>

          <label className="search-box">
            <SearchOutlined />
            <input placeholder="Search for products..." aria-label="Search" />
          </label>

          <div className="header-actions">
            <button className="icon-button mobile-search" aria-label="Search">
              <SearchOutlined />
            </button>
            <Link className="icon-button" href="/cart" aria-label="Cart">
              <ShoppingCartOutlined />
            </Link>
            <button
              className="icon-button"
              aria-label="Account"
              onClick={() => setAuthOpen(true)}
            >
              <UserOutlined />
            </button>
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
