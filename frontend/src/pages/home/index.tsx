import { useState } from 'react';
import { Layout, Button, Row, Col, Card, Typography, Tag, Rate, Space } from 'antd';
import {
  ThunderboltOutlined,
  GiftOutlined,
  SafetyOutlined,
  CarOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  CameraOutlined,
  BookOutlined,
  ArrowRightOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { AppHeader } from '../../components/layout/AppHeader';
import { AppFooter } from '../../components/layout/AppFooter';
import { AuthModal } from '../auth/components/AuthModal';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const CATEGORIES = [
  { icon: <LaptopOutlined />, label: 'Điện tử', color: '#1677ff', bg: '#e6f4ff' },
  { icon: <SkinOutlined />, label: 'Thời trang', color: '#eb2f96', bg: '#fff0f6' },
  { icon: <HomeOutlined />, label: 'Nhà cửa', color: '#faad14', bg: '#fffbe6' },
  { icon: <MedicineBoxOutlined />, label: 'Làm đẹp', color: '#52c41a', bg: '#f6ffed' },
  { icon: <CameraOutlined />, label: 'Phụ kiện', color: '#722ed1', bg: '#f9f0ff' },
  { icon: <BookOutlined />, label: 'Sách', color: '#fa8c16', bg: '#fff7e6' },
];

const PERKS = [
  { icon: <CarOutlined />, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 300k' },
  { icon: <ThunderboltOutlined />, title: 'Giao hàng nhanh', desc: 'Nhận hàng trong 2h' },
  { icon: <SafetyOutlined />, title: 'Bảo hành chính hãng', desc: 'Cam kết 100% hàng thật' },
  { icon: <GiftOutlined />, title: 'Quà tặng hấp dẫn', desc: 'Ưu đãi mỗi ngày' },
];

const NAMES = [
  'Tai nghe Sony WH-1000XM5', 'iPhone 15 Pro Max', 'Áo thun Uniqlo',
  'Máy lọc không khí', 'Laptop Dell XPS 13', 'Nước hoa Chanel',
  'Bàn phím cơ Keychron', 'Đồng hồ Casio',
];
const PRICES = [4990000, 28990000, 299000, 3490000, 32990000, 5990000, 2190000, 1290000];
const ORI_PRICES = [5490000, 32000000, 399000, 3990000, 35000000, 6990000, 2590000, 1590000];
const RATINGS = [4.8, 4.9, 4.5, 4.7, 4.8, 4.6, 4.9, 4.4];
const SOLD = [1234, 987, 5231, 432, 789, 2341, 1567, 3421];
const TAGS = ['Bán chạy', 'Mới', 'Sale', 'Bán chạy', 'Mới', 'Sale', 'Bán chạy', 'Mới'];
const TAG_COLORS = ['red', 'blue', 'orange', 'red', 'blue', 'orange', 'red', 'blue'];
const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
];
const PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1, name: NAMES[i], price: PRICES[i], originalPrice: ORI_PRICES[i],
  rating: RATINGS[i], sold: SOLD[i], tag: TAGS[i], tagColor: TAG_COLORS[i], gradient: GRADIENTS[i],
}));

const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <AppHeader onLoginClick={() => setAuthOpen(true)} />

      <Content>
        {/* ── HERO ─────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
            padding: 'clamp(48px, 8vw, 96px) 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(22,119,255,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(22,119,255,0.1)' }} />
          <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
            <Tag color="blue" style={{ marginBottom: 16, fontSize: 13, borderRadius: 20, padding: '2px 12px' }}>
              🎉 Tháng 3 siêu sale — Giảm đến 70%
            </Tag>
            <Title
              level={1}
              style={{ color: '#fff', fontSize: 'clamp(26px,5vw,52px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}
            >
              Mua sắm thông minh,<br />
              <span style={{ color: '#40a9ff' }}>giá tốt mỗi ngày</span>
            </Title>
            <Paragraph style={{ color: '#adc6e8', fontSize: 16, marginBottom: 32 }}>
              Hàng triệu sản phẩm chính hãng từ thương hiệu uy tín. Giao hàng nhanh, đổi trả dễ dàng.
            </Paragraph>
            <Space size={12} wrap style={{ justifyContent: 'center' }}>
              <Button
                type="primary" size="large" icon={<FireOutlined />}
                style={{ borderRadius: 24, height: 48, padding: '0 32px', fontWeight: 600, fontSize: 15 }}
              >
                Khám phá ngay
              </Button>
              <Button
                size="large" ghost
                style={{ borderRadius: 24, height: 48, padding: '0 28px', fontWeight: 600, fontSize: 15, color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              >
                Xem ưu đãi
              </Button>
            </Space>
          </div>
        </div>

        {/* ── PERKS ─────────────────────────────── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Row>
              {PERKS.map((p) => (
                <Col key={p.title} xs={12} sm={12} md={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', borderRight: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 26, color: '#1677ff' }}>{p.icon}</div>
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{p.title}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{p.desc}</Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── CATEGORIES ─────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0 }}>Danh mục nổi bật</Title>
            <Button type="link" icon={<ArrowRightOutlined />} style={{ padding: 0, fontWeight: 500 }}>Xem tất cả</Button>
          </div>
          <Row gutter={[16, 16]}>
            {CATEGORIES.map((cat) => (
              <Col key={cat.label} xs={8} sm={8} md={4}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', borderRadius: 16, border: 'none', background: cat.bg }}
                  styles={{ body: { padding: '20px 8px' } }}
                >
                  <div style={{ fontSize: 32, color: cat.color, marginBottom: 8 }}>{cat.icon}</div>
                  <Text strong style={{ fontSize: 13, color: '#333' }}>{cat.label}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* ── PRODUCTS ────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0 }}>
              <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              Sản phẩm nổi bật
            </Title>
            <Button type="link" icon={<ArrowRightOutlined />} style={{ padding: 0, fontWeight: 500 }}>Xem tất cả</Button>
          </div>
          <Row gutter={[16, 16]}>
            {PRODUCTS.map((p) => (
              <Col key={p.id} xs={12} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  cover={
                    <div style={{ height: 180, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Tag color={p.tagColor} style={{ position: 'absolute', top: 10, left: 10, borderRadius: 8, fontWeight: 600 }}>
                        {p.tag}
                      </Tag>
                      <LaptopOutlined style={{ fontSize: 52, color: 'rgba(255,255,255,0.7)' }} />
                    </div>
                  }
                  styles={{ body: { padding: '12px 14px' } }}
                >
                  <Text strong style={{ display: 'block', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </Text>
                  <Space size={4} style={{ marginBottom: 6 }}>
                    <Rate disabled defaultValue={p.rating} style={{ fontSize: 11 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>({p.sold.toLocaleString()})</Text>
                  </Space>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <Text strong style={{ color: '#ff4d4f', fontSize: 15 }}>{fmt(p.price)}</Text>
                    <Text delete type="secondary" style={{ fontSize: 12 }}>{fmt(p.originalPrice)}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Button size="large" style={{ borderRadius: 24, padding: '0 40px', fontWeight: 600 }}>Xem thêm sản phẩm</Button>
          </div>
        </div>
      </Content>

      <AppFooter />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </Layout>
  );
}
