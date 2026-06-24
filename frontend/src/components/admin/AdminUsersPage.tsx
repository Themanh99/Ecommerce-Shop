'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminOpsApi, type AdminRole, type AdminUser } from '@/lib/adminOps';
import { useAuthStore } from '@/stores/authStore';

export function AdminUsersPage({ roleFilter }: { roleFilter?: AdminRole }) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [q, setQ] = useState('');
  const [staffOpen, setStaffOpen] = useState(false);
  const [role, setRole] = useState<AdminRole | undefined>(roleFilter);
  const query = useQuery({
    queryKey: ['admin-users', q, role],
    queryFn: () => adminOpsApi.users({ q: q || undefined, role, limit: 50 }),
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  const roleMutation = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: AdminRole }) => adminOpsApi.updateUserRole(id, nextRole),
    onSuccess: () => {
      message.success('Đã cập nhật quyền.');
      refresh();
    },
  });
  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminOpsApi.updateUserActive(id, isActive),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái.');
      refresh();
    },
  });
  const staffMutation = useMutation({
    mutationFn: adminOpsApi.createStaff,
    onSuccess: () => {
      message.success('Đã tạo tài khoản nhân sự.');
      setStaffOpen(false);
      refresh();
    },
  });

  const columns: ColumnsType<AdminUser> = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (value) => value || '—' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone', render: (value) => value || '—' },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      render: (value: AdminRole, record) => (
        <Select
          value={value}
          disabled={record.id === currentUser?.id}
          style={{ width: 120 }}
          options={[
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'SALE', label: 'SALE' },
            { value: 'USER', label: 'USER' },
          ]}
          onChange={(nextRole) => roleMutation.mutate({ id: record.id, nextRole })}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: boolean, record) => (
        <Switch
          checked={value}
          disabled={record.id === currentUser?.id}
          checkedChildren="Mở"
          unCheckedChildren="Khóa"
          onChange={(isActive) => activeMutation.mutate({ id: record.id, isActive })}
        />
      ),
    },
    {
      title: 'Xác thực',
      key: 'verified',
      render: (_, record) => (
        <Space>
          <Tag color={record.isEmailVerified ? 'green' : 'default'}>Email</Tag>
          <Tag color={record.isPhoneVerified ? 'green' : 'default'}>SĐT</Tag>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" className="admin-full-width">
      <Card>
        <Space wrap className="admin-toolbar">
          <Input.Search placeholder="Tìm tên, email, số điện thoại" allowClear onSearch={setQ} style={{ width: 320 }} />
          {!roleFilter && (
            <Select
              allowClear
              placeholder="Lọc quyền"
              value={role}
              style={{ width: 180 }}
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'SALE', label: 'SALE' },
                { value: 'USER', label: 'USER' },
              ]}
              onChange={setRole}
            />
          )}
          <Button type="primary" onClick={() => setStaffOpen(true)}>
            Tạo nhân sự SALE
          </Button>
        </Space>
      </Card>

      <Card title={roleFilter === 'USER' ? 'Danh sách khách hàng' : 'User & phân quyền'}>
        <Table rowKey="id" columns={columns} dataSource={query.data?.items ?? []} loading={query.isLoading} pagination={{ pageSize: 12 }} />
      </Card>

      <Modal title="Tạo tài khoản nhân sự" open={staffOpen} onCancel={() => setStaffOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={(values) => staffMutation.mutate({ ...values, role: 'SALE' })}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu tạm" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={staffMutation.isPending}>
            Tạo nhân sự
          </Button>
        </Form>
      </Modal>
    </Space>
  );
}
