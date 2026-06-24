'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, Skeleton } from 'antd';
import api from '@/lib/api';

type AdminSettings = {
  shopName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  shippingFeeDefault: number;
  freeShippingThreshold: number;
  orderExpiryHours: number;
};

export default function SettingsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get<AdminSettings>('/settings/admin').then((res) => res.data),
  });
  const mutation = useMutation({
    mutationFn: (payload: Partial<AdminSettings>) => api.patch('/settings', payload),
    onSuccess: () => {
      message.success('Đã lưu cấu hình shop.');
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });

  if (query.isLoading) return <Skeleton active />;

  return (
    <Card title="Cấu hình shop MoonKid">
      <Form layout="vertical" initialValues={query.data ?? {}} onFinish={(values) => mutation.mutate(values)}>
        <div className="admin-form-grid">
          <Form.Item name="shopName" label="Tên shop">
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo URL">
            <Input />
          </Form.Item>
          <Form.Item name="faviconUrl" label="Favicon URL">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Hotline">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email hỗ trợ">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="shippingFeeDefault" label="Phí ship mặc định">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="freeShippingThreshold" label="Ngưỡng freeship">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="orderExpiryHours" label="Giờ giữ đơn chuyển khoản">
            <InputNumber min={1} className="full-width" />
          </Form.Item>
          <Form.Item name="facebookUrl" label="Facebook">
            <Input />
          </Form.Item>
          <Form.Item name="instagramUrl" label="Instagram">
            <Input />
          </Form.Item>
          <Form.Item name="youtubeUrl" label="Youtube">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả footer">
            <Input.TextArea rows={3} />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Lưu cấu hình</Button>
      </Form>
    </Card>
  );
}
