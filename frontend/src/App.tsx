import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import viVN from 'antd/locale/vi_VN';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './pages/auth/components/ProtectedRoute';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/home'));
const GoogleCallbackPage = React.lazy(() => import('./pages/auth/GoogleCallbackPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
});

export default function App() {
  const { fetchMe, logout } = useAuthStore();

  useEffect(() => {
    fetchMe();
    // Listen for forced-logout event from Axios interceptor
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
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
          <BrowserRouter>
            <React.Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth/callback" element={<GoogleCallbackPage />} />
                {/* Admin + Sale only */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALE']} />}>
                  <Route path="/admin/*" element={<AdminDashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
