'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Input, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminOpsApi, type AdminOrder, type OrderStatus, type PaymentStatus } from '@/lib/adminOps';
import { formatPrice } from '@/lib/storefront';

export default function OrdersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>();
  const query = useQuery({
    queryKey: ['admin-orders', q, status, paymentStatus],
    queryFn: () => adminOpsApi.orders({ q: q || undefined, status, paymentStatus, limit: 50 }),
  });

  const columns: ColumnsType<AdminOrder> = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code', render: (value, record) => <Link href={`/admin/orders/${record.id}`}>{value}</Link> },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone' },
    { title: 'Tổng tiền', dataIndex: 'total', key: 'total', render: (value: number) => formatPrice(value) },
    { title: 'Thanh toán', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (value) => <Tag>{value}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (value) => <Tag color={value === 'PENDING' ? 'orange' : value === 'DONE' ? 'green' : 'blue'}>{value}</Tag> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (value) => new Date(value).toLocaleString('vi-VN') },
  ];

  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card>
        <Space wrap className="admin-toolbar">
          <Input.Search placeholder="Tìm mã đơn, khách hàng, SĐT" allowClear onSearch={setQ} style={{ width: 320 }} />
          <Select allowClear placeholder="Trạng thái" style={{ width: 190 }} onChange={setStatus} options={['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DONE', 'CANCELLED'].map((value) => ({ value, label: value }))} />
          <Select allowClear placeholder="Thanh toán" style={{ width: 170 }} onChange={setPaymentStatus} options={['UNPAID', 'PAID', 'REFUNDED'].map((value) => ({ value, label: value }))} />
        </Space>
      </Card>
      <Card title="Đơn hàng">
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>
    </Space>
  );
}
