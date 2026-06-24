'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { Avatar, Button, Drawer, Dropdown, Grid, Input, Layout, Menu, Spin, Tag } from 'antd';
import {
  AuditOutlined,
  BarChartOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  FileImageOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ProductOutlined,
  SearchOutlined,
  SettingOutlined,
  ShoppingOutlined,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useAuthStore, type UserRole } from '@/stores/authStore';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

type AdminShellProps = {
  children: ReactNode;
};

type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: NavItem[];
  adminOnly?: boolean;
};

const navigation: NavItem[] = [
  { key: '/admin', label: 'Tổng quan', href: '/admin', icon: <DashboardOutlined /> },
  {
    key: 'sales',
    label: 'Bán hàng',
    icon: <ShoppingOutlined />,
    children: [
      { key: '/admin/orders', label: 'Đơn hàng', href: '/admin/orders' },
      { key: '/admin/customers', label: 'Khách hàng', href: '/admin/customers' },
      { key: '/admin/reviews', label: 'Đánh giá', href: '/admin/reviews' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: <ProductOutlined />,
    children: [
      { key: '/admin/products', label: 'Sản phẩm', href: '/admin/products' },
      { key: '/admin/categories', label: 'Danh mục', href: '/admin/categories', adminOnly: true },
      { key: '/admin/tags', label: 'Tag', href: '/admin/tags', adminOnly: true },
      { key: '/admin/inventory', label: 'Tồn kho', href: '/admin/inventory' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: <GiftOutlined />,
    children: [
      { key: '/admin/banners', label: 'Banner', href: '/admin/banners', adminOnly: true },
      { key: '/admin/vouchers', label: 'Voucher', href: '/admin/vouchers', adminOnly: true },
      { key: '/admin/campaigns', label: 'Campaign', href: '/admin/campaigns', adminOnly: true },
    ],
  },
  {
    key: 'website',
    label: 'Website',
    icon: <BgColorsOutlined />,
    children: [
      { key: '/admin/settings', label: 'Cấu hình shop', href: '/admin/settings', adminOnly: true },
      { key: '/admin/footer', label: 'Footer', href: '/admin/footer', adminOnly: true },
      { key: '/admin/media', label: 'Media', href: '/admin/media', adminOnly: true },
    ],
  },
  {
    key: 'system',
    label: 'Nhân sự & hệ thống',
    icon: <TeamOutlined />,
    children: [
      { key: '/admin/users', label: 'User & phân quyền', href: '/admin/users', adminOnly: true },
      { key: '/admin/audit-logs', label: 'Audit log', href: '/admin/audit-logs', adminOnly: true },
      { key: '/admin/reports', label: 'Báo cáo', href: '/admin/reports', adminOnly: true },
    ],
  },
];

const titleByPath: Record<string, string> = {
  '/admin': 'Tổng quan vận hành',
  '/admin/orders': 'Quản lý đơn hàng',
  '/admin/customers': 'Khách hàng',
  '/admin/reviews': 'Duyệt đánh giá',
  '/admin/products': 'Sản phẩm',
  '/admin/categories': 'Danh mục',
  '/admin/tags': 'Tag sản phẩm',
  '/admin/inventory': 'Tồn kho',
  '/admin/banners': 'Banner',
  '/admin/vouchers': 'Voucher',
  '/admin/campaigns': 'Campaign',
  '/admin/settings': 'Cấu hình shop',
  '/admin/footer': 'Footer',
  '/admin/media': 'Media',
  '/admin/users': 'User & phân quyền',
  '/admin/audit-logs': 'Audit log',
  '/admin/reports': 'Báo cáo',
};

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const isMobile = !screens.lg;

  const selectedKey = useMemo(() => {
    const exact = Object.keys(titleByPath)
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname === path || pathname.startsWith(`${path}/`));
    return exact ?? '/admin';
  }, [pathname]);

  const menuItems = useMemo<MenuProps['items']>(
    () => navigation.map((item) => toMenuItem(item, user?.role)),
    [user?.role],
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!isInitialized) {
    return (
      <div className="route-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role === 'USER') return null;

  const sidebar = (
    <div className="admin-sidebar-inner">
      <Link href="/admin" className="admin-brand">
        <span className="admin-brand-mark">☾</span>
        {!collapsed && (
          <span>
            <strong>MoonKid</strong>
            <small>Ops Center</small>
          </span>
        )}
      </Link>
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['sales', 'catalog', 'marketing', 'website', 'system']}
        className="admin-menu"
        onClick={() => setDrawerOpen(false)}
      />
    </div>
  );

  return (
    <Layout className="admin-app-shell">
      {isMobile ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={310}
          className="admin-drawer"
        >
          {sidebar}
        </Drawer>
      ) : (
        <Sider
          width={286}
          collapsedWidth={88}
          collapsed={collapsed}
          className="admin-sidebar"
          trigger={null}
        >
          {sidebar}
        </Sider>
      )}

      <Layout className="admin-main-layout">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <Button
              type="text"
              icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed((value) => !value))}
            />
            <div>
              <div className="admin-breadcrumb">
                <HomeOutlined /> / Admin
              </div>
              <h1>{titleByPath[selectedKey] ?? 'MoonKid Admin'}</h1>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <Input
              className="admin-search"
              prefix={<SearchOutlined />}
              placeholder="Tìm đơn, sản phẩm, khách hàng..."
              disabled
            />
            <Tag color={user.role === 'ADMIN' ? 'purple' : 'blue'}>{user.role}</Tag>
            <Dropdown
              menu={{
                items: [
                  { key: 'store', icon: <HomeOutlined />, label: <Link href="/">Xem storefront</Link> },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
                ],
              }}
              trigger={['click']}
            >
              <button className="admin-user-button">
                <Avatar size={34} icon={<UserOutlined />} src={user.avatar || undefined} />
                <span>{user.name}</span>
              </button>
            </Dropdown>
          </div>
        </header>
        <Content className="admin-page-content">{children}</Content>
      </Layout>
    </Layout>
  );
}

function toMenuItem(item: NavItem, role?: UserRole): NonNullable<MenuProps['items']>[number] {
  const locked = item.adminOnly && role !== 'ADMIN';
  return {
    key: item.key,
    icon: item.icon,
    disabled: locked,
    label: item.href && !locked ? <Link href={item.href}>{item.label}</Link> : locked ? `${item.label} 🔒` : item.label,
    children: item.children?.map((child) => toMenuItem(child, role)),
  };
}
