'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { useAuthStore } from '@/stores/authStore';

const adminRoles = new Set(['ADMIN', 'SALE']);

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    if (adminRoles.has(user?.role ?? '')) {
      router.replace('/admin');
    }
  }, [isAuthenticated, isInitialized, router, user?.role]);

  if (!isInitialized || !isAuthenticated || !user || adminRoles.has(user.role)) {
    return (
      <main>
        <AppHeader />
        <div className="route-loading">
          <Spin size="large" />
        </div>
        <AppFooter />
      </main>
    );
  }

  return (
    <main>
      <AppHeader />
      <section className="container account-page">
        <div className="account-card">
          <p className="eyebrow">MoonKid account</p>
          <h1>Tài khoản của tôi</h1>
          <dl>
            <div>
              <dt>Họ tên</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email || 'Chưa cập nhật'}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{user.phone || 'Chưa cập nhật'}</dd>
            </div>
            <div>
              <dt>Vai trò</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
          <div className="account-actions">
            <Link className="button button-outline" href="/shop">
              Tiếp tục mua sắm
            </Link>
            <button className="button button-dark" onClick={() => logout()}>
              Đăng xuất
            </button>
          </div>
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
