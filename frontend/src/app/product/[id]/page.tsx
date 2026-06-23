import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/store/ProductDetail';
import { products } from '@/data/store';

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
