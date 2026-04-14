'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/authStore';

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    const role = params.get('role');
    fetchMe().then(() => {
      if (role === 'ADMIN' || role === 'SALE') router.replace('/admin');
      else router.replace('/');
    });
  }, [params, router, fetchMe]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" tip="Đang đăng nhập..." />
    </div>
  );
}

/** Handles redirect from Google OAuth backend callback */
export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
