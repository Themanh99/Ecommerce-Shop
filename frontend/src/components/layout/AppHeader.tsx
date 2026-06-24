'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import {
  CloseOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useAuthStore } from '@/stores/authStore';

const adminRoles = new Set(['ADMIN', 'SALE']);

export function AppHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const accountItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: adminRoles.has(user?.role ?? '') ? <DashboardOutlined /> : <UserOutlined />,
      label: (
        <Link href={adminRoles.has(user?.role ?? '') ? '/admin' : '/account'}>
          {adminRoles.has(user?.role ?? '') ? 'Trang quản trị' : 'Tài khoản của tôi'}
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <div className="announcement">
        Đăng ký thành viên MoonKid và nhận ưu đãi cho đơn hàng đầu tiên.{' '}
        {!isAuthenticated && <button onClick={() => setAuthOpen(true)}>Đăng ký ngay</button>}
      </div>
      <header className="site-header">
        <div className="container header-row">
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>

          <Link className="logo" href="/">
            <span className="logo-moon">☾</span> MoonKid
          </Link>

          <nav className={`main-nav ${menuOpen ? 'main-nav-open' : ''}`}>
            <Link href="/shop">Sản phẩm</Link>
            <Link href="/shop?tag=so-sinh">Đồ sơ sinh</Link>
            <Link href="/shop?tag=be-gai">Bé gái</Link>
            <Link href="/shop?tag=be-trai">Bé trai</Link>
          </nav>

          <label className="search-box">
            <SearchOutlined />
            <input
              placeholder="Tìm quần áo cho bé..."
              aria-label="Tìm kiếm"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const value = event.currentTarget.value.trim();
                  router.push(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop');
                }
              }}
            />
          </label>

          <div className="header-actions">
            <button className="icon-button mobile-search" aria-label="Tìm kiếm">
              <SearchOutlined />
            </button>
            <Link className="icon-button" href="/cart" aria-label="Giỏ hàng">
              <ShoppingCartOutlined />
            </Link>
            {isAuthenticated ? (
              <Dropdown menu={{ items: accountItems }} placement="bottomRight" trigger={['click']}>
                <button className="icon-button" aria-label="Tài khoản">
                  <UserOutlined />
                </button>
              </Dropdown>
            ) : (
              <button
                className="icon-button"
                aria-label="Đăng nhập"
                onClick={() => setAuthOpen(true)}
              >
                <UserOutlined />
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
