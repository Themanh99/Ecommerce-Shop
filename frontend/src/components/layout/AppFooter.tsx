import Link from 'next/link';
import {
  FacebookFilled,
  GithubFilled,
  InstagramFilled,
  TwitterOutlined,
} from '@ant-design/icons';

const columns = [
  {
    title: 'Company',
    links: ['About', 'Features', 'Works', 'Career'],
  },
  {
    title: 'Help',
    links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'],
  },
  {
    title: 'FAQ',
    links: ['Account', 'Manage Deliveries', 'Orders', 'Payments'],
  },
  {
    title: 'Resources',
    links: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist'],
  },
];

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="container newsletter">
        <h2>Stay up to date about our latest offers</h2>
        <form>
          <label>
            <span aria-hidden="true">✉</span>
            <input type="email" placeholder="Enter your email address" />
          </label>
          <button type="submit">Subscribe to Newsletter</button>
        </form>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo">
            SHOP.CO
          </Link>
          <p>
            We have clothes that suit your style and which you&apos;re proud to
            wear. From women to men.
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
        <p>Shop.co © 2000–2026, All Rights Reserved</p>
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
