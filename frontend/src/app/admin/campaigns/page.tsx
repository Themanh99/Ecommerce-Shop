import { AdminPlaceholderPage } from '@/components/admin/AdminPlaceholderPage';

export default function CampaignsPage() {
  return (
    <AdminPlaceholderPage
      title="Campaign marketing"
      description="Khu vực thiết kế chiến dịch theo mùa, landing page và lịch hiển thị ưu đãi."
      items={['Lên lịch campaign', 'Gắn banner/voucher/sản phẩm', 'Theo dõi hiệu quả theo doanh thu']}
      ctaHref="/admin/banners"
      ctaLabel="Quản lý banner trước"
    />
  );
}
