'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useAuthStore } from '@/stores/authStore';

function AuthInitializer({ children }: { children: ReactNode }) {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void fetchMe();

    const handleLogout = () => {
      void logout();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [fetchMe, logout]);

  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 60_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily: "Inter, 'Segoe UI', sans-serif",
          },
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <AntApp>
          <AuthInitializer>{children}</AuthInitializer>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
