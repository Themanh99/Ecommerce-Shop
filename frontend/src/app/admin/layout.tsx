'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { AdminShell } from '@/components/admin/AdminShell';
import { useAuthStore } from '@/stores/authStore';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !user || user.role === 'USER') {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router, user]);

  if (!isInitialized) {
    return (
      <div className="route-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role === 'USER') return null;

  return <AdminShell>{children}</AdminShell>;
}
