'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, Space, Switch, Table } from 'antd';
import api from '@/lib/api';

type FooterColumn = {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links: Array<{ id: string; label: string; url: string; sortOrder: number; isActive: boolean }>;
};

export default function FooterPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-footer-columns'],
    queryFn: () => api.get<FooterColumn[]>('/settings/columns').then((res) => res.data),
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-footer-columns'] });
  const createColumn = useMutation({
    mutationFn: (payload: Partial<FooterColumn>) => api.post('/settings/columns', payload),
    onSuccess: () => { message.success('Đã tạo cột footer.'); refresh(); },
  });
  const createLink = useMutation({
    mutationFn: (payload: { footerColumnId: string; label: string; url: string; sortOrder?: number; isActive?: boolean }) => api.post('/settings/links', payload),
    onSuccess: () => { message.success('Đã tạo link footer.'); refresh(); },
  });

  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card title="Tạo cột footer">
        <Form layout="inline" onFinish={(values) => createColumn.mutate({ isActive: true, ...values })}>
          <Form.Item name="title" rules={[{ required: true }]}>
            <Input placeholder="HELP" />
          </Form.Item>
          <Form.Item name="sortOrder" initialValue={0}>
            <InputNumber placeholder="Thứ tự" />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" initialValue>
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
          <Button type="primary" htmlType="submit">Tạo cột</Button>
        </Form>
      </Card>
      <Card title="Footer columns & links">
        <Table
          rowKey="id"
          dataSource={query.data ?? []}
          loading={query.isLoading}
          expandable={{
            expandedRowRender: (record) => (
              <Space direction="vertical" className="admin-full-width">
                <Form layout="inline" onFinish={(values) => createLink.mutate({ footerColumnId: record.id, isActive: true, ...values })}>
                  <Form.Item name="label" rules={[{ required: true }]}>
                    <Input placeholder="Liên hệ" />
                  </Form.Item>
                  <Form.Item name="url" rules={[{ required: true }]}>
                    <Input placeholder="/contact" />
                  </Form.Item>
                  <Form.Item name="sortOrder" initialValue={0}>
                    <InputNumber placeholder="Thứ tự" />
                  </Form.Item>
                  <Button htmlType="submit">Thêm link</Button>
                </Form>
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={record.links}
                  columns={[
                    { title: 'Label', dataIndex: 'label', key: 'label' },
                    { title: 'URL', dataIndex: 'url', key: 'url' },
                    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder' },
                  ]}
                />
              </Space>
            ),
          }}
          columns={[
            { title: 'Cột', dataIndex: 'title', key: 'title' },
            { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder' },
            { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (value) => (value ? 'Bật' : 'Tắt') },
          ]}
        />
      </Card>
    </Space>
  );
}
