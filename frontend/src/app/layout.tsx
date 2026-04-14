'use client';

import { useEffect, type ReactNode } from 'react';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import viVN from 'antd/locale/vi_VN';
import { useAuthStore } from '@/stores/authStore';
import './globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
});

function AuthInitializer({ children }: { children: ReactNode }) {
  const { fetchMe, logout } = useAuthStore();

  useEffect(() => {
    fetchMe();
    // Listen for forced-logout event from Axios interceptor
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [fetchMe, logout]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EShop — Mua sắm thông minh</title>
        <meta name="description" content="EShop — Mua sắm thông minh, giá tốt mỗi ngày. Hàng triệu sản phẩm chính hãng." />
      </head>
      <body>
        <AntdRegistry>
          <QueryClientProvider client={queryClient}>
            <ConfigProvider
              locale={viVN}
              theme={{
                token: {
                  colorPrimary: '#1677ff',
                  borderRadius: 8,
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                },
                algorithm: theme.defaultAlgorithm,
              }}
            >
              <AntApp>
                <AuthInitializer>
                  {children}
                </AuthInitializer>
              </AntApp>
            </ConfigProvider>
          </QueryClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
