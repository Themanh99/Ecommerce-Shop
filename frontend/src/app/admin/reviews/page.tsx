'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminOpsApi, type AdminReview } from '@/lib/adminOps';

export default function ReviewsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [isApproved, setIsApproved] = useState<boolean | undefined>();
  const query = useQuery({
    queryKey: ['admin-reviews', isApproved],
    queryFn: () => adminOpsApi.reviews({ isApproved, limit: 50 }),
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  const approve = useMutation({ mutationFn: adminOpsApi.approveReview, onSuccess: () => { message.success('Đã duyệt đánh giá.'); refresh(); } });
  const reject = useMutation({ mutationFn: adminOpsApi.rejectReview, onSuccess: () => { message.success('Đã ẩn đánh giá.'); refresh(); } });
  const columns: ColumnsType<AdminReview> = [
    { title: 'Sản phẩm', key: 'product', render: (_, record) => record.product?.name ?? '—' },
    { title: 'Khách', key: 'user', render: (_, record) => record.user?.name ?? '—' },
    { title: 'Sao', dataIndex: 'rating', key: 'rating', render: (value) => '★'.repeat(value) },
    { title: 'Nội dung', key: 'content', render: (_, record) => record.content || record.title || '—' },
    { title: 'Trạng thái', dataIndex: 'isApproved', key: 'isApproved', render: (value) => <Tag color={value ? 'green' : 'orange'}>{value ? 'Đã duyệt' : 'Chờ duyệt'}</Tag> },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => approve.mutate(record.id)}>Duyệt</Button>
          <Button size="small" danger onClick={() => reject.mutate(record.id)}>Ẩn</Button>
        </Space>
      ),
    },
  ];
  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card>
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          style={{ width: 220 }}
          onChange={setIsApproved}
          options={[
            { value: false, label: 'Chờ duyệt' },
            { value: true, label: 'Đã duyệt' },
          ]}
        />
      </Card>
      <Card title="Đánh giá sản phẩm">
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>
    </Space>
  );
}
