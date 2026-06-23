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
        Đăng ký thành viên và nhận ưu đãi 20% cho đơn đầu tiên.{' '}
        <button onClick={() => setAuthOpen(true)}>Đăng ký ngay</button>
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
            <span className="logo-moon">☾</span> MoonKid
          </Link>

          <nav className={`main-nav ${menuOpen ? 'main-nav-open' : ''}`}>
            <Link href="/shop">Sản phẩm</Link>
            <Link href="/shop?age=baby">Đồ sơ sinh</Link>
            <Link href="/shop?gender=girl">Bé gái</Link>
            <Link href="/shop?gender=boy">Bé trai</Link>
          </nav>

          <label className="search-box">
            <SearchOutlined />
            <input placeholder="Tìm quần áo cho bé..." aria-label="Tìm kiếm" />
          </label>

          <div className="header-actions">
            <button className="icon-button mobile-search" aria-label="Tìm kiếm">
              <SearchOutlined />
            </button>
            <Link className="icon-button" href="/cart" aria-label="Giỏ hàng">
              <ShoppingCartOutlined />
            </Link>
            <button
              className="icon-button"
              aria-label="Tài khoản"
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
