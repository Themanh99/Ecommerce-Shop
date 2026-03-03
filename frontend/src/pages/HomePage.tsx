import React, { useState } from 'react';
import { Button, Layout, Space, Typography, Avatar } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuthStore } from '../stores/authStore';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>EShop</Title>
        <Space>
          <Button icon={<ShoppingCartOutlined />} shape="circle" />
          {isAuthenticated && user ? (
            <Space>
              <Avatar icon={<UserOutlined />} src={user.avatar} />
              <span>{user.name}</span>
              {(user.role === 'ADMIN' || user.role === 'SALE') && (
                <Button href="/admin" type="primary" size="small">Quản trị</Button>
              )}
              <Button onClick={() => logout()} size="small">Đăng xuất</Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setAuthOpen(true)}>Đăng nhập</Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Chào mừng đến EShop 🛍️</Title>
          {!isAuthenticated && (
            <Button type="primary" size="large" onClick={() => setAuthOpen(true)}>
              Đăng nhập để bắt đầu mua sắm
            </Button>
          )}
        </div>
      </Content>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </Layout>
  );
}
