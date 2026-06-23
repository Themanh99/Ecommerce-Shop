import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import { products, reviews } from '@/data/store';

const dressStyles = [
  {
    name: 'Casual',
    image:
      '/images/store/product-1.jpg',
  },
  {
    name: 'Formal',
    image:
      '/images/store/formal.jpg',
  },
  {
    name: 'Party',
    image:
      '/images/store/party.jpg',
  },
  {
    name: 'Gym',
    image:
      '/images/store/gym.jpg',
  },
];

export default function HomePage() {
  return (
    <main>
      <AppHeader />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">New season / 2026</p>
            <h1>Find clothes that match your style</h1>
            <p className="hero-description">
              Browse through our diverse range of meticulously crafted
              garments, designed to bring out your individuality and cater to
              your sense of style.
            </p>
            <Link className="button button-dark hero-cta" href="/shop">
              Shop now
            </Link>
            <div className="hero-stats" aria-label="Shop statistics">
              <div>
                <strong>200+</strong>
                <span>International brands</span>
              </div>
              <div>
                <strong>2,000+</strong>
                <span>High-quality products</span>
              </div>
              <div>
                <strong>30,000+</strong>
                <span>Happy customers</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <span className="spark spark-large">✦</span>
            <span className="spark spark-small">✦</span>
            <Image
              src="/images/store/hero.jpg"
              alt="Models wearing contemporary streetwear"
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
          <span>VERSACE</span>
          <span>ZARA</span>
          <span>GUCCI</span>
          <span>PRADA</span>
          <span>Calvin Klein</span>
        </div>
      </div>

      <ProductSection
        title="New arrivals"
        products={products.slice(0, 4)}
        href="/shop?sort=new"
      />

      <div className="section-divider container" />

      <ProductSection
        title="Top selling"
        products={products.slice(4, 8)}
        href="/shop?sort=popular"
      />

      <section className="section">
        <div className="container style-browser">
          <h2>Browse by dress style</h2>
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
                  alt={`${style.name} clothing`}
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
            <h2>Our happy customers</h2>
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
            View all <ArrowRightOutlined />
          </Link>
        </div>
        <div className="product-grid">
          {sectionProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <div className="section-action">
          <Link href={href} className="button button-outline">
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
