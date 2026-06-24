'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Alert, Card, Empty, List, Progress, Skeleton, Space, Tag } from 'antd';
import {
  AlertOutlined,
  DollarOutlined,
  InboxOutlined,
  ShoppingOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { adminOpsApi, type RevenuePoint, type StatusPoint } from '@/lib/adminOps';
import { formatPrice } from '@/lib/storefront';

const statusLabel: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DONE: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export default function AdminDashboardPage() {
  const summaryQuery = useQuery({ queryKey: ['admin-dashboard-summary'], queryFn: adminOpsApi.summary });
  const revenueQuery = useQuery({
    queryKey: ['admin-dashboard-revenue', '7d'],
    queryFn: () => adminOpsApi.revenue('7d'),
  });
  const statusQuery = useQuery({
    queryKey: ['admin-dashboard-status'],
    queryFn: adminOpsApi.ordersByStatus,
  });

  const summary = summaryQuery.data;
  const metrics = summary?.metrics;

  return (
    <div className="admin-dashboard">
      <section className="admin-hero-panel">
        <div>
          <p className="admin-eyebrow">MoonKid Ops Ribbon</p>
          <h2>Hôm nay cửa hàng cần chú ý gì?</h2>
          <p>
            Theo dõi đơn hàng, tồn kho, đánh giá và catalog trong một màn. Dữ liệu lấy trực tiếp từ
            hệ thống để vận hành không bị “mù sương”.
          </p>
        </div>
        <div className="admin-ribbon">
          <span>{metrics?.pendingOrders ?? 0} đơn chờ</span>
          <span>{metrics?.lowStockVariants ?? 0} tồn kho thấp</span>
          <span>{metrics?.pendingReviews ?? 0} review chờ duyệt</span>
        </div>
      </section>

      {summaryQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <div className="admin-kpi-grid">
            <KpiCard icon={<DollarOutlined />} label="Doanh thu hôm nay" value={formatPrice(metrics?.revenueToday ?? 0)} />
            <KpiCard icon={<ShoppingOutlined />} label="Đơn chờ xử lý" value={metrics?.pendingOrders ?? 0} href="/admin/orders?status=PENDING" />
            <KpiCard icon={<InboxOutlined />} label="Sản phẩm active" value={metrics?.activeProducts ?? 0} href="/admin/products" />
            <KpiCard icon={<TeamOutlined />} label="Khách hàng" value={metrics?.totalCustomers ?? 0} href="/admin/customers" />
            <KpiCard icon={<AlertOutlined />} label="Tồn kho thấp" value={metrics?.lowStockVariants ?? 0} href="/admin/inventory?lowStock=true" />
            <KpiCard icon={<StarOutlined />} label="Review chờ duyệt" value={metrics?.pendingReviews ?? 0} href="/admin/reviews?isApproved=false" />
          </div>

          <div className="admin-dashboard-grid">
            <Card title="Doanh thu 7 ngày" className="admin-card">
              <RevenueBars data={revenueQuery.data ?? []} />
            </Card>
            <Card title="Đơn hàng theo trạng thái" className="admin-card">
              <StatusBars data={statusQuery.data ?? []} />
            </Card>
          </div>

          <div className="admin-dashboard-grid admin-dashboard-grid-wide">
            <Card title="Việc cần xử lý" className="admin-card">
              <Space direction="vertical" className="admin-full-width" size="middle">
                <TodoLine label="Đơn chờ xác nhận" count={summary?.todo.pendingOrders.length ?? 0} href="/admin/orders?status=PENDING" />
                <TodoLine label="Biến thể tồn kho thấp" count={summary?.todo.lowStockVariants.length ?? 0} href="/admin/inventory?lowStock=true" />
                <TodoLine label="Đánh giá chờ duyệt" count={summary?.todo.pendingReviews.length ?? 0} href="/admin/reviews?isApproved=false" />
                <TodoLine label="Banner đang tắt" count={summary?.todo.inactiveBanners.length ?? 0} href="/admin/banners" />
              </Space>
            </Card>
            <Card title="Sức khỏe catalog" className="admin-card">
              <div className="admin-catalog-health">
                <Progress percent={percent(summary?.catalog.activeProducts ?? 0, summary?.catalog.products ?? 0)} strokeColor="#7b61ff" />
                <div className="admin-health-grid">
                  <span>{summary?.catalog.products ?? 0}<small>Sản phẩm</small></span>
                  <span>{summary?.catalog.categories ?? 0}<small>Danh mục</small></span>
                  <span>{summary?.catalog.tags ?? 0}<small>Tag</small></span>
                  <span>{summary?.catalog.banners ?? 0}<small>Banner</small></span>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Hoạt động gần đây" className="admin-card">
            {summary?.recentActivity.length ? (
              <List
                dataSource={summary.recentActivity}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.user.name} ${item.action} ${item.entity}`}
                      description={`${item.entityId} • ${new Date(item.createdAt).toLocaleString('vi-VN')}`}
                    />
                    <Tag>{item.user.role}</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Chưa có nhật ký thao tác. Các thay đổi admin sẽ xuất hiện tại đây." />
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string | number; href?: string }) {
  const content = (
    <Card className="admin-kpi-card">
      <div className="admin-kpi-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function RevenueBars({ data }: { data: RevenuePoint[] }) {
  if (!data.length) return <Empty description="Chưa có doanh thu." />;
  const max = Math.max(...data.map((item) => item.revenue), 1);
  return (
    <div className="admin-bar-chart">
      {data.map((item) => (
        <div className="admin-bar-column" key={item.date}>
          <div className="admin-bar" style={{ height: `${Math.max(8, (item.revenue / max) * 150)}px` }} />
          <small>{new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</small>
        </div>
      ))}
    </div>
  );
}

function StatusBars({ data }: { data: StatusPoint[] }) {
  if (!data.length) return <Empty description="Chưa có đơn hàng." />;
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <Space direction="vertical" className="admin-full-width">
      {data.map((item) => (
        <div className="admin-status-row" key={item.status}>
          <span>{statusLabel[item.status]}</span>
          <Progress percent={percent(item.count, total)} showInfo={false} strokeColor="#ffb84d" />
          <strong>{item.count}</strong>
        </div>
      ))}
      {total === 0 && <Alert type="info" showIcon message="Chưa có đơn hàng, dashboard sẽ tự cập nhật khi có dữ liệu." />}
    </Space>
  );
}

function TodoLine({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link href={href} className="admin-todo-line">
      <span>{label}</span>
      <Tag color={count > 0 ? 'orange' : 'green'}>{count}</Tag>
    </Link>
  );
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
