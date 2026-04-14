'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, user, allowedRoles, redirectTo, router]);

  // Show nothing while checking auth
  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
