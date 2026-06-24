'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { adminOpsApi, type InventoryItem } from '@/lib/adminOps';
import { formatPrice } from '@/lib/storefront';

export default function InventoryPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [lowStock, setLowStock] = useState(false);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const query = useQuery({
    queryKey: ['admin-inventory', lowStock],
    queryFn: () => adminOpsApi.inventory({ lowStock: lowStock || undefined, limit: 80 }),
  });
  const adjust = useMutation({
    mutationFn: adminOpsApi.adjustInventory,
    onSuccess: () => {
      message.success('Đã điều chỉnh tồn kho.');
      setAdjusting(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
  const columns: ColumnsType<InventoryItem> = [
    { title: 'Sản phẩm', key: 'product', render: (_, record) => record.product.name },
    { title: 'Phân loại', dataIndex: 'optionLabel', key: 'optionLabel' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (value: number) => formatPrice(value) },
    { title: 'Tồn', dataIndex: 'stock', key: 'stock' },
    { title: 'Đang giữ', dataIndex: 'stockReserved', key: 'stockReserved' },
    { title: 'Có thể bán', dataIndex: 'stockAvailable', key: 'stockAvailable', render: (value, record) => <Tag color={record.isLowStock ? 'red' : 'green'}>{value}</Tag> },
    { title: 'Thao tác', key: 'actions', render: (_, record) => <Button size="small" onClick={() => setAdjusting(record)}>Điều chỉnh</Button> },
  ];
  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card>
        <Space>
          <span>Chỉ xem tồn kho thấp</span>
          <Switch checked={lowStock} onChange={setLowStock} />
        </Space>
      </Card>
      <Card title="Tồn kho biến thể">
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>
      <Modal title={`Điều chỉnh tồn kho ${adjusting?.sku ?? ''}`} open={Boolean(adjusting)} onCancel={() => setAdjusting(null)} footer={null}>
        <Form layout="vertical" onFinish={(values) => adjusting && adjust.mutate({ variantId: adjusting.id, ...values })}>
          <Form.Item name="delta" label="Số lượng tăng/giảm" rules={[{ required: true }]}>
            <InputNumber className="full-width" placeholder="VD: 10 hoặc -2" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={adjust.isPending}>Lưu điều chỉnh</Button>
        </Form>
      </Modal>
    </Space>
  );
}
