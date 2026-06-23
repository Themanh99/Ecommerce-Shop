import Link from 'next/link';
import {
  FacebookFilled,
  GithubFilled,
  InstagramFilled,
  TwitterOutlined,
} from '@ant-design/icons';

const columns = [
  {
    title: 'MoonKid',
    links: ['Về chúng tôi', 'Câu chuyện thương hiệu', 'Tuyển dụng', 'Hệ thống cửa hàng'],
  },
  {
    title: 'Hỗ trợ',
    links: ['Trung tâm trợ giúp', 'Chính sách giao hàng', 'Đổi trả & hoàn tiền', 'Liên hệ'],
  },
  {
    title: 'Mua sắm',
    links: ['Tài khoản', 'Theo dõi đơn hàng', 'Hướng dẫn chọn size', 'Thanh toán'],
  },
  {
    title: 'Góc ba mẹ',
    links: ['Chăm sóc bé', 'Phối đồ cho bé', 'Mẹo chọn chất liệu', 'Cẩm nang theo mùa'],
  },
];

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="container newsletter">
        <h2>Nhận tin mới và ưu đãi dành riêng cho bé</h2>
        <form>
          <label>
            <span aria-hidden="true">✉</span>
            <input type="email" placeholder="Nhập địa chỉ email của bạn" />
          </label>
          <button type="submit">Đăng ký nhận tin</button>
        </form>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <span className="logo-moon">☾</span> MoonKid
          </Link>
          <p>
            Thời trang trẻ em mềm mại, an toàn và đáng yêu, đồng hành cùng bé
            trong từng khoảnh khắc lớn khôn.
          </p>
          <div className="socials">
            <Link href="#" aria-label="Twitter"><TwitterOutlined /></Link>
            <Link href="#" aria-label="Facebook"><FacebookFilled /></Link>
            <Link href="#" aria-label="Instagram"><InstagramFilled /></Link>
            <Link href="#" aria-label="Github"><GithubFilled /></Link>
          </div>
        </div>

        {columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <Link href="#" key={link}>{link}</Link>
            ))}
          </div>
        ))}
      </div>

      <div className="container footer-bottom">
        <p>MoonKid © 2026. Đã đăng ký bản quyền.</p>
        <div className="payments" aria-label="Accepted payment methods">
          <span>VISA</span>
          <span>●●</span>
          <span>Pay</span>
          <span>G Pay</span>
        </div>
      </div>
    </footer>
  );
}
