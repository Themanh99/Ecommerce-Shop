'use client';

import { use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Descriptions, Empty, Select, Space, Table, Tag, Timeline } from 'antd';
import { adminOpsApi, type OrderStatus, type PaymentStatus } from '@/lib/adminOps';
import { formatPrice } from '@/lib/storefront';

const nextStatuses: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DONE'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['admin-order', id], queryFn: () => adminOpsApi.order(id) });
  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => adminOpsApi.updateOrderStatus(id, status),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái.');
      void queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
  const paymentMutation = useMutation({
    mutationFn: (paymentStatus: PaymentStatus) => adminOpsApi.updateOrderPayment(id, paymentStatus),
    onSuccess: () => {
      message.success('Đã cập nhật thanh toán.');
      void queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => adminOpsApi.cancelOrder(id, 'Admin hủy trên hệ thống'),
    onSuccess: () => {
      message.success('Đã hủy đơn.');
      void queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
    },
  });
  const order = query.data;

  if (!query.isLoading && !order) return <Empty description="Không tìm thấy đơn hàng." />;

  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card title={`Chi tiết đơn ${order?.code ?? ''}`} loading={query.isLoading}>
        {order && (
          <>
            <Descriptions bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Khách hàng">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.customerEmail || '—'}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatPrice(order.total)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag>{order.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Thanh toán"><Tag>{order.paymentStatus}</Tag></Descriptions.Item>
            </Descriptions>
            <Space wrap style={{ marginTop: 18 }}>
              <Select
                placeholder="Chuyển trạng thái"
                style={{ width: 220 }}
                options={nextStatuses.map((value) => ({ value, label: value }))}
                onChange={(value) => statusMutation.mutate(value)}
              />
              <Select
                placeholder="Thanh toán"
                style={{ width: 180 }}
                options={['UNPAID', 'PAID', 'REFUNDED'].map((value) => ({ value, label: value }))}
                onChange={(value) => paymentMutation.mutate(value)}
              />
              <Button danger loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                Hủy đơn
              </Button>
            </Space>
          </>
        )}
      </Card>
      <Card title="Sản phẩm trong đơn">
        <Table
          rowKey="id"
          dataSource={order?.items ?? []}
          pagination={false}
          columns={[
            { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
            { title: 'Phân loại', dataIndex: 'variantName', key: 'variantName' },
            { title: 'SKU', dataIndex: 'sku', key: 'sku' },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Giá', dataIndex: 'price', key: 'price', render: (value: number) => formatPrice(value) },
            { title: 'Tạm tính', dataIndex: 'subtotal', key: 'subtotal', render: (value: number) => formatPrice(value) },
          ]}
        />
      </Card>
      <Card title="Timeline trạng thái">
        <Timeline
          items={(order?.statusLogs ?? []).map((log: any) => ({
            children: `${log.fromStatus || 'NEW'} → ${log.toStatus} • ${new Date(log.createdAt).toLocaleString('vi-VN')}`,
          }))}
        />
      </Card>
    </Space>
  );
}
