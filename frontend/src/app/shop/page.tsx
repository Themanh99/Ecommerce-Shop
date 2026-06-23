import Link from 'next/link';
import { FilterOutlined, RightOutlined } from '@ant-design/icons';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/store/ProductCard';
import { products } from '@/data/store';

const filterColors = [
  '#00c12b',
  '#f50606',
  '#f5dd06',
  '#f57906',
  '#06caf5',
  '#063af5',
  '#7d06f5',
  '#f506a4',
  '#ffffff',
  '#000000',
];

export default function ShopPage() {
  return (
    <main>
      <AppHeader />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <RightOutlined />
          <span>Casual</span>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filters-header">
              <h2>Filters</h2>
              <FilterOutlined />
            </div>

            <div className="filter-group category-list">
              {['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'].map((item) => (
                <div className="filter-label" key={item}>
                  <span>{item}</span>
                  <RightOutlined />
                </div>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Price</span>
                <span>⌃</span>
              </div>
              <div className="price-track" />
              <div className="price-values">
                <span>$50</span>
                <span>$200</span>
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Colors</span>
                <span>⌃</span>
              </div>
              <div className="color-list">
                {filterColors.map((color) => (
                  <span
                    className="color-dot"
                    key={color}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Size</span>
                <span>⌃</span>
              </div>
              <div className="size-list">
                {[
                  'XX-Small',
                  'X-Small',
                  'Small',
                  'Medium',
                  'Large',
                  'X-Large',
                  'XX-Large',
                ].map((size) => (
                  <button className={size === 'Large' ? 'pill active' : 'pill'} key={size}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group category-list">
              <div className="filter-label">
                <span>Dress Style</span>
                <span>⌃</span>
              </div>
              {['Casual', 'Formal', 'Party', 'Gym'].map((style) => (
                <div className="filter-label" key={style}>
                  <span>{style}</span>
                  <RightOutlined />
                </div>
              ))}
            </div>

            <button className="button button-dark filter-apply">Apply Filter</button>
          </aside>

          <section>
            <div className="shop-heading">
              <h1 className="page-title">Casual</h1>
              <p>
                <span>Showing 1–9 of 100 Products</span>{' '}
                <label>
                  Sort by:{' '}
                  <select defaultValue="popular">
                    <option value="popular">Most Popular</option>
                    <option value="new">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </label>
              </p>
            </div>

            <div className="product-grid shop-products">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>

            <nav className="pagination" aria-label="Product pagination">
              <button>←</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <span>…</span>
              <button>10</button>
              <button>→</button>
            </nav>
          </section>
        </div>
      </div>
      <AppFooter />
    </main>
  );
}
