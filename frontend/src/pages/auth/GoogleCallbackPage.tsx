import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../stores/authStore';

/** Handles redirect from Google OAuth backend callback */
export default function GoogleCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    const role = params.get('role');
    fetchMe().then(() => {
      if (role === 'ADMIN' || role === 'SALE') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" tip="Đang đăng nhập..." />
    </div>
  );
}
