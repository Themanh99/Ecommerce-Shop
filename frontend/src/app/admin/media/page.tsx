import { AdminPlaceholderPage } from '@/components/admin/AdminPlaceholderPage';

export default function MediaPage() {
  return (
    <AdminPlaceholderPage
      title="Media library"
      description="Phase này sản phẩm/banner đang nhập ảnh bằng URL. Upload MinIO/object storage sẽ làm ở module media riêng."
      items={['Upload ảnh sản phẩm/banner', 'Quản lý alt text', 'Tái sử dụng ảnh theo bộ sưu tập']}
      ctaHref="/admin/products"
      ctaLabel="Nhập ảnh URL ở sản phẩm"
    />
  );
}
