'use client';

import Link from 'next/link';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import {
  AppstoreOutlined,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

const { Footer } = Layout;
const { Text, Title } = Typography;

const FOOTER_LINKS = {
  'Về EShop': ['Giới thiệu', 'Tuyển dụng', 'Điều khoản', 'Chính sách bảo mật'],
  'Hỗ trợ': ['Trung tâm trợ giúp', 'Hướng dẫn mua hàng', 'Trả hàng & hoàn tiền', 'Liên hệ'],
  'Theo dõi chúng tôi': ['Facebook', 'Instagram', 'Youtube', 'TikTok'],
};

export function AppFooter() {
  return (
    <Footer
      style={{
        background: '#1a1a2e',
        color: '#ccc',
        padding: '48px 24px 24px',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[48, 32]}>
          {/* Brand column */}
          <Col xs={24} sm={24} md={7}>
            <Space align="center" style={{ marginBottom: 12 }}>
              <AppstoreOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                EShop
              </Title>
            </Space>
            <Text style={{ color: '#aaa', display: 'block', marginBottom: 16, lineHeight: 1.7 }}>
              Mua sắm thông minh, giá tốt mỗi ngày. Hàng triệu sản phẩm chính hãng, giao hàng nhanh toàn quốc.
            </Text>
            <Space>
              <PhoneOutlined style={{ color: '#1677ff' }} />
              <Text style={{ color: '#ccc' }}>1800 1234</Text>
            </Space>
            <br />
            <Space style={{ marginTop: 8 }}>
              <MailOutlined style={{ color: '#1677ff' }} />
              <Text style={{ color: '#ccc' }}>support@eshop.vn</Text>
            </Space>
            <div style={{ marginTop: 16 }}>
              <Space size={12}>
                <FacebookOutlined style={{ fontSize: 20, color: '#aaa', cursor: 'pointer' }} />
                <InstagramOutlined style={{ fontSize: 20, color: '#aaa', cursor: 'pointer' }} />
              </Space>
            </div>
          </Col>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <Col xs={12} sm={8} md={4} key={title}>
              <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                {title}
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map((link) => (
                  <Link
                    key={link}
                    href="#"
                    style={{
                      color: '#aaa',
                      fontSize: 14,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#fff')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#aaa')}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </Col>
          ))}
        </Row>

        <Divider style={{ borderColor: '#333', margin: '32px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Text style={{ color: '#666', fontSize: 13 }}>
            © 2026 EShop. All rights reserved.
          </Text>
          <Text style={{ color: '#666', fontSize: 13 }}>
            🇻🇳 Việt Nam
          </Text>
        </div>
      </div>
    </Footer>
  );
}
