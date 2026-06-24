'use client';

/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductCardItem, StorefrontHome } from '@/lib/storefront';
import { productPlaceholder, storefrontApi } from '@/lib/storefront';

const fallbackCategories = [
  { name: 'Bé trai', slug: 'be-trai', image: '/images/store/moonkid-boys-girls.jpg' },
  { name: 'Bé gái', slug: 'be-gai', image: '/images/store/moonkid-winter.jpg' },
  { name: 'Sơ sinh', slug: 'so-sinh', image: '/images/store/moonkid-baby.jpg' },
  { name: 'Năng động', slug: 'nang-dong', image: '/images/store/moonkid-sport.jpg' },
];

const parentReviews = [
  {
    name: 'Chị Hà, Hà Nội',
    text: 'Vải mềm, form vừa xinh, bé mặc đi học cả ngày vẫn thoải mái.',
  },
  {
    name: 'Anh Minh, Đà Nẵng',
    text: 'Màu sắc đáng yêu, giao hàng gọn gàng. Mình rất thích chính sách đổi size.',
  },
  {
    name: 'Chị Linh, TP.HCM',
    text: 'MoonKid có gu rất trẻ con mà vẫn tinh tế, chụp ảnh lên đẹp lắm.',
  },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['storefront-home'],
    queryFn: storefrontApi.home,
  });

  const home: StorefrontHome = data ?? {
    banners: [],
    featuredCategories: [],
    bestSellers: [],
    newArrivals: [],
  };
  const heroBanner = home.banners[0];
  const categories =
    home.featuredCategories.length > 0
      ? home.featuredCategories.map((category) => ({
          name: category.name,
          slug: category.slug,
          image: category.imageUrl || productPlaceholder,
        }))
      : fallbackCategories;

  return (
    <main>
      <AppHeader />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">MoonKid / Thời trang trẻ em Việt</p>
            <h1>
              <span>Để bé tự tin</span>
              <span>khám phá thế giới</span>
            </h1>
            <p className="hero-description">
              {heroBanner?.subtitle ||
                'Quần áo mềm mại, an toàn và thoải mái cho từng bước lớn khôn. MoonKid đồng hành cùng bé từ những ngày đầu tiên đến mọi cuộc phiêu lưu tuổi thơ.'}
            </p>
            <Link className="button button-dark hero-cta" href={heroBanner?.linkUrl || '/shop'}>
              {heroBanner?.buttonText || 'Mua sắm ngay'}
            </Link>
            <div className="hero-stats" aria-label="Cam kết của MoonKid">
              <div>
                <strong>0–12</strong>
                <span>Độ tuổi phù hợp</span>
              </div>
              <div>
                <strong>7 ngày</strong>
                <span>Hỗ trợ đổi size</span>
              </div>
              <div>
                <strong>MoonKid</strong>
                <span>Êm mềm cho bé, yên tâm cho ba mẹ</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <span className="spark spark-large">✦</span>
            <span className="spark spark-small">✦</span>
            {heroBanner?.imageUrl ? (
              <img
                src={heroBanner.imageUrl}
                alt={heroBanner.title}
                className="hero-image"
                loading="eager"
              />
            ) : (
              <Image
                src="/images/store/moonkid-hero.jpg"
                alt="Nhóm trẻ em mặc trang phục thời trang của MoonKid"
                fill
                priority
                sizes="(max-width: 760px) 100vw, 50vw"
                className="hero-image"
              />
            )}
          </div>
        </div>
      </section>

      <div className="brand-strip" id="brands" aria-label="Danh mục nổi bật">
        <div className="container brand-row">
          <span>SƠ SINH</span>
          <span>BÉ GÁI</span>
          <span>BÉ TRAI</span>
          <span>ĐỒ MẶC NHÀ</span>
          <span>PHỤ KIỆN</span>
        </div>
      </div>

      <ProductSection
        title="Sản phẩm mới"
        products={home.newArrivals}
        href="/shop?sort=newest"
        isLoading={isLoading}
      />

      <div className="section-divider container" />

      <ProductSection
        title="Bán chạy nhất"
        products={home.bestSellers}
        href="/shop?sort=best_seller"
        isLoading={isLoading}
      />

      <section className="section">
        <div className="container style-browser">
          <h2>Mua sắm theo nhu cầu</h2>
          <div className="style-grid">
            {categories.map((style, index) => (
              <Link
                href={`/shop?category=${style.slug}`}
                className={`style-card style-card-${index + 1}`}
                key={style.slug}
              >
                <span>{style.name}</span>
                {style.image.startsWith('/') ? (
                  <Image
                    src={style.image}
                    alt={`Thời trang trẻ em: ${style.name}`}
                    fill
                    sizes="(max-width: 760px) 50vw, 40vw"
                  />
                ) : (
                  <img src={style.image} alt={`Thời trang trẻ em: ${style.name}`} />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section review-section">
        <div className="container">
          <div className="section-heading review-heading">
            <h2>Ba mẹ nói gì về MoonKid</h2>
            <div className="review-arrows" aria-hidden="true">
              <span>←</span>
              <span>→</span>
            </div>
          </div>
          <div className="review-grid">
            {parentReviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="stars">★★★★★</div>
                <h3>
                  {review.name} <span className="verified">✓</span>
                </h3>
                <p>“{review.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}

function ProductSection({
  title,
  products,
  href,
  isLoading,
}: {
  title: string;
  products: ProductCardItem[];
  href: string;
  isLoading: boolean;
}) {
  return (
    <section className="section product-section">
      <div className="container">
        <div className="section-heading">
          <h2>{title}</h2>
          <Link href={href} className="text-link mobile-only-link">
            Xem tất cả <ArrowRightOutlined />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {isLoading ? 'Đang tải sản phẩm MoonKid...' : 'Chưa có sản phẩm, vui lòng quay lại sau.'}
          </div>
        )}
        <div className="section-action">
          <Link href={href} className="button button-outline">
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
}
