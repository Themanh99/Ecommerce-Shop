import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MoonKid — Thời trang cho bé',
    template: '%s | MoonKid',
  },
  description:
    'MoonKid mang đến quần áo trẻ em thoải mái, an toàn và đáng yêu cho bé từ sơ sinh đến 12 tuổi.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
