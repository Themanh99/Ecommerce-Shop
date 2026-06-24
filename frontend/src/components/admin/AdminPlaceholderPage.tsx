import Link from 'next/link';
import { Card, Empty, Tag } from 'antd';

export function AdminPlaceholderPage({
  title,
  description,
  items,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  items: string[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card className="admin-placeholder-card">
      <Tag color="purple">Sắp triển khai</Tag>
      <Empty
        description={
          <div className="admin-placeholder-copy">
            <h2>{title}</h2>
            <p>{description}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {ctaHref && ctaLabel ? (
              <Link className="button button-dark" href={ctaHref}>
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        }
      />
    </Card>
  );
}
