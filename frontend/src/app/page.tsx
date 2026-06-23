import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import { products, reviews } from '@/data/store';

const dressStyles = [
  {
    name: 'Bé trai',
    image: '/images/store/moonkid-boys-girls.jpg',
  },
  {
    name: 'Bé gái',
    image: '/images/store/moonkid-winter.jpg',
  },
  {
    name: 'Sơ sinh',
    image: '/images/store/moonkid-baby.jpg',
  },
  {
    name: 'Năng động',
    image: '/images/store/moonkid-sport.jpg',
  },
];

export default function HomePage() {
  return (
    <main>
      <AppHeader />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Bộ sưu tập mới / 2026</p>
            <h1>
              <span>Để bé tự tin</span>
              <span>khám phá thế giới</span>
            </h1>
            <p className="hero-description">
              Quần áo mềm mại, an toàn và thoải mái cho từng bước lớn khôn.
              MoonKid đồng hành cùng bé từ những ngày đầu tiên đến mọi cuộc
              phiêu lưu tuổi thơ.
            </p>
            <Link className="button button-dark hero-cta" href="/shop">
              Mua sắm ngay
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
                <strong>30.000+</strong>
                <span>Gia đình tin chọn</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <span className="spark spark-large">✦</span>
            <span className="spark spark-small">✦</span>
            <Image
              src="/images/store/moonkid-hero.jpg"
              alt="Nhóm trẻ em mặc trang phục thời trang của MoonKid"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      <div className="brand-strip" id="brands" aria-label="Featured brands">
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
        products={products.slice(0, 4)}
        href="/shop?sort=new"
      />

      <div className="section-divider container" />

      <ProductSection
        title="Bán chạy nhất"
        products={products.slice(4, 8)}
        href="/shop?sort=popular"
      />

      <section className="section">
        <div className="container style-browser">
          <h2>Mua sắm theo nhu cầu</h2>
          <div className="style-grid">
            {dressStyles.map((style, index) => (
              <Link
                href={`/shop?style=${style.name.toLowerCase()}`}
                className={`style-card style-card-${index + 1}`}
                key={style.name}
              >
                <span>{style.name}</span>
                <Image
                  src={style.image}
                  alt={`Thời trang trẻ em: ${style.name}`}
                  fill
                  sizes="(max-width: 760px) 50vw, 40vw"
                />
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
            {reviews.map((review) => (
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
  products: sectionProducts,
  href,
}: {
  title: string;
  products: typeof products;
  href: string;
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
        <div className="product-grid">
          {sectionProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <div className="section-action">
          <Link href={href} className="button button-outline">
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
}
