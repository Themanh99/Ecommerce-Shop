'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore, type UserRole } from '@/stores/authStore';

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/** Protect admin routes — redirect to home if not authenticated or wrong role */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'SALE']}>
      {children}
    </ProtectedRoute>
  );
}

function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }: Props) {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isInitialized, user, allowedRoles, redirectTo, router]);

  if (!isInitialized) {
    return (
      <div className="route-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
