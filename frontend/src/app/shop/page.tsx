import { Suspense } from 'react';
import { ShopClient } from './ShopClient';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container empty-state">Đang tải cửa hàng MoonKid...</div>}>
      <ShopClient />
    </Suspense>
  );
}
