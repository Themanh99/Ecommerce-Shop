import { useState } from 'react';
import type { MenuProps } from 'antd';
import {
  Layout,
  Input,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Drawer,
  Space,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Header } = Layout;
const { Text } = Typography;

const NAV_LINKS = [
  { label: 'Tất cả', key: 'all' },
  { label: 'Điện tử', key: 'electronics' },
  { label: 'Thời trang', key: 'fashion' },
  { label: 'Nhà cửa', key: 'home' },
  { label: 'Làm đẹp', key: 'beauty' },
];

interface Props {
  onLoginClick: () => void;
  cartCount?: number;
}

export function AppHeader({ onLoginClick, cartCount = 0 }: Props) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'account',
      icon: <UserOutlined />,
      label: 'Tài khoản của tôi',
    },
    ...(user?.role === 'ADMIN' || user?.role === 'SALE'
      ? [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: 'Quản trị',
            onClick: () => (window.location.href = '/admin'),
          },
        ]
      : []),
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <AppstoreOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <span style={{ fontWeight: 700, fontSize: 20, color: '#1677ff', letterSpacing: -0.5 }}>
            EShop
          </span>
        </a>

        {/* Search — Desktop only */}
        <div className="header-search">
          <Input
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="large"
            variant="filled"
            style={{ borderRadius: 24 }}
          />
        </div>

        {/* Nav links — Desktop only */}
        <nav className="header-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={`/category/${link.key}`}
              style={{
                color: '#444',
                fontWeight: 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                padding: '4px 2px',
                borderBottom: '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#1677ff';
                (e.currentTarget as HTMLElement).style.borderBottomColor = '#1677ff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#444';
                (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions */}
        <Space size={8}>
          <Badge count={cartCount} size="small">
            <Button
              icon={<ShoppingCartOutlined />}
              shape="circle"
              size="large"
              style={{ border: 'none', background: '#f5f5f5' }}
            />
          </Badge>

          {/* Auth — Desktop */}
          <div className="header-auth">
            {isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar
                    src={user.avatar}
                    icon={!user.avatar ? <UserOutlined /> : undefined}
                    style={{ background: '#1677ff' }}
                    size={34}
                  />
                  <Text strong style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ').pop() ?? user.name}
                  </Text>
                </Space>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={onLoginClick} style={{ borderRadius: 20, fontWeight: 600 }}>
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Hamburger — Mobile only */}
          <Button
            icon={<MenuOutlined />}
            shape="circle"
            className="header-hamburger"
            style={{ border: 'none', background: '#f5f5f5' }}
            onClick={() => setDrawerOpen(true)}
          />
        </Space>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
      >
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm..."
          size="large"
          variant="filled"
          style={{ marginBottom: 24, borderRadius: 12 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={`/category/${link.key}`}
              style={{ padding: '12px 16px', borderRadius: 8, color: '#333', fontWeight: 500, fontSize: 15 }}
              onClick={() => setDrawerOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {isAuthenticated && user ? (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Avatar icon={<UserOutlined />} src={user.avatar} />
              <Text strong>{user.name}</Text>
            </Space>
            <Button block danger onClick={() => { void logout(); setDrawerOpen(false); }}>
              Đăng xuất
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            block
            size="large"
            onClick={() => { onLoginClick(); setDrawerOpen(false); }}
          >
            Đăng nhập / Đăng ký
          </Button>
        )}
      </Drawer>

      <style>{`
        .header-search { flex: 1; max-width: 480px; }
        .header-nav { display: flex; gap: 20px; flex-shrink: 0; }
        .header-hamburger { display: none !important; }
        @media (max-width: 900px) { .header-nav { display: none; } }
        @media (max-width: 640px) {
          .header-search { display: none; }
          .header-auth { display: none; }
          .header-hamburger { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
