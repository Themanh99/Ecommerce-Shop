'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminOpsApi, type AuditAction, type AuditLogItem } from '@/lib/adminOps';
import { useState } from 'react';

export default function AuditLogsPage() {
  const [action, setAction] = useState<AuditAction | undefined>();
  const query = useQuery({
    queryKey: ['admin-audit-logs', action],
    queryFn: () => adminOpsApi.auditLogs({ action, limit: 50 }),
  });
  const columns: ColumnsType<AuditLogItem> = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (value) => new Date(value).toLocaleString('vi-VN') },
    { title: 'Người thao tác', key: 'user', render: (_, record) => `${record.user.name} (${record.user.role})` },
    { title: 'Hành động', dataIndex: 'action', key: 'action', render: (value) => <Tag>{value}</Tag> },
    { title: 'Đối tượng', dataIndex: 'entity', key: 'entity' },
    { title: 'ID', dataIndex: 'entityId', key: 'entityId' },
  ];
  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card>
        <Select
          allowClear
          placeholder="Lọc hành động"
          style={{ width: 220 }}
          onChange={setAction}
          options={['CREATE', 'UPDATE', 'DELETE'].map((value) => ({ value, label: value }))}
        />
      </Card>
      <Card title="Nhật ký thao tác">
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>
    </Space>
  );
}
