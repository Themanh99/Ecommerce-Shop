import { Layout, Typography } from 'antd';

const { Content } = Layout;

export default function AdminDashboard() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: 24 }}>
        <Typography.Title level={2}>Admin Dashboard 🛠️</Typography.Title>
        <Typography.Text>Chức năng quản trị sẽ được phát triển ở Module tiếp theo.</Typography.Text>
      </Content>
    </Layout>
  );
}
