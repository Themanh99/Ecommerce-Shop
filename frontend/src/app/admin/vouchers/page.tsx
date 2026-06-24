'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, Select, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminOpsApi, type AdminVoucher } from '@/lib/adminOps';
import { formatPrice } from '@/lib/storefront';

export default function VouchersPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['admin-vouchers'], queryFn: () => adminOpsApi.vouchers({ limit: 50 }) });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
  const create = useMutation({ mutationFn: adminOpsApi.createVoucher, onSuccess: () => { message.success('Đã tạo voucher.'); refresh(); } });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminVoucher> }) => adminOpsApi.updateVoucher(id, payload),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: adminOpsApi.deleteVoucher, onSuccess: () => { message.success('Đã xóa voucher.'); refresh(); } });
  const columns: ColumnsType<AdminVoucher> = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (value) => <Tag>{value}</Tag> },
    { title: 'Giá trị', key: 'value', render: (_, record) => record.type === 'PERCENT' ? `${record.value}%` : formatPrice(record.value) },
    { title: 'Đã dùng', dataIndex: 'usedCount', key: 'usedCount' },
    { title: 'Public', dataIndex: 'isPublic', key: 'isPublic', render: (value, record) => <Switch checked={value} onChange={(isPublic) => update.mutate({ id: record.id, payload: { isPublic } })} /> },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (value, record) => <Switch checked={value} onChange={(isActive) => update.mutate({ id: record.id, payload: { isActive } })} /> },
    { title: 'Xóa', key: 'delete', render: (_, record) => <Button danger size="small" onClick={() => remove.mutate(record.id)}>Xóa</Button> },
  ];
  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card title="Tạo voucher">
        <Form layout="vertical" onFinish={(values) => create.mutate(values)} initialValues={{ type: 'PERCENT', minOrderValue: 0, perUserLimit: 1, isActive: true, isPublic: false }}>
          <div className="admin-form-grid">
            <Form.Item name="code" label="Mã voucher" rules={[{ required: true }]}>
              <Input placeholder="MOONKID20" />
            </Form.Item>
            <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
              <Select options={[{ value: 'PERCENT', label: 'Phần trăm' }, { value: 'FIXED', label: 'Số tiền' }]} />
            </Form.Item>
            <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}>
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="minOrderValue" label="Đơn tối thiểu">
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="maxDiscount" label="Giảm tối đa">
              <InputNumber min={0} className="full-width" />
            </Form.Item>
            <Form.Item name="usageLimit" label="Số lượt dùng">
              <InputNumber min={1} className="full-width" />
            </Form.Item>
            <Form.Item name="perUserLimit" label="Mỗi user dùng tối đa">
              <InputNumber min={1} className="full-width" />
            </Form.Item>
            <Form.Item name="isPublic" label="Hiện công khai" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" loading={create.isPending}>Tạo voucher</Button>
        </Form>
      </Card>
      <Card title="Voucher hiện có">
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>
    </Space>
  );
}
