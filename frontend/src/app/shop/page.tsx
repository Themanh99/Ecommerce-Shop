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
          <Link href="/">Trang chủ</Link>
          <RightOutlined />
          <span>Thời trang trẻ em</span>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filters-header">
              <h2>Bộ lọc</h2>
              <FilterOutlined />
            </div>

            <div className="filter-group category-list">
              {['Áo thun', 'Quần short', 'Áo sơ mi', 'Áo khoác', 'Quần jeans'].map((item) => (
                <div className="filter-label" key={item}>
                  <span>{item}</span>
                  <RightOutlined />
                </div>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Khoảng giá</span>
                <span>⌃</span>
              </div>
              <div className="price-track" />
              <div className="price-values">
                <span>100.000đ</span>
                <span>500.000đ</span>
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label">
                <span>Màu sắc</span>
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
                <span>Kích cỡ</span>
                <span>⌃</span>
              </div>
              <div className="size-list">
                {[
                  '0–3 tháng',
                  '3–6 tháng',
                  '6–12 tháng',
                  '1–2 tuổi',
                  '3–5 tuổi',
                  '6–8 tuổi',
                  '9–12 tuổi',
                ].map((size) => (
                  <button className={size === '3–5 tuổi' ? 'pill active' : 'pill'} key={size}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group category-list">
              <div className="filter-label">
                <span>Nhu cầu</span>
                <span>⌃</span>
              </div>
              {['Đi học', 'Đi chơi', 'Dự tiệc', 'Vận động'].map((style) => (
                <div className="filter-label" key={style}>
                  <span>{style}</span>
                  <RightOutlined />
                </div>
              ))}
            </div>

            <button className="button button-dark filter-apply">Áp dụng bộ lọc</button>
          </aside>

          <section>
            <div className="shop-heading">
              <h1 className="page-title">Sản phẩm cho bé</h1>
              <p>
                <span>Hiển thị 1–9 trong 100 sản phẩm</span>{' '}
                <label>
                  Sắp xếp:{' '}
                  <select defaultValue="popular">
                    <option value="popular">Phổ biến nhất</option>
                    <option value="new">Mới nhất</option>
                    <option value="price-low">Giá thấp đến cao</option>
                  </select>
                </label>
              </p>
            </div>

            <div className="product-grid shop-products">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>

            <nav className="pagination" aria-label="Phân trang sản phẩm">
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
