import { AdminPlaceholderPage } from '@/components/admin/AdminPlaceholderPage';

export default function ReportsPage() {
  return (
    <AdminPlaceholderPage
      title="Báo cáo nâng cao"
      description="Dashboard hiện đã có KPI và biểu đồ vận hành. Khu vực này dành cho báo cáo xuất file và phân tích sâu."
      items={['Báo cáo doanh thu theo tháng', 'Báo cáo tồn kho', 'Báo cáo khách hàng và voucher']}
      ctaHref="/admin"
      ctaLabel="Xem dashboard tổng quan"
    />
  );
}
