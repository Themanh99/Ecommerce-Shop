import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for database seeding');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@moonkid.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'MoonKid@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Quản trị MoonKid',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
    create: {
      name: 'Quản trị MoonKid',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const settings = await prisma.systemSetting.findFirst();
  const settingsData = {
    shopName: 'MoonKid',
    description:
      'Thời trang trẻ em mềm mại, an toàn và thoải mái cho bé từ sơ sinh đến 12 tuổi.',
    phone: '1900 1234',
    email: 'support@moonkid.vn',
    address: 'Việt Nam',
    shippingFeeDefault: 30000,
    freeShippingThreshold: 500000,
    orderExpiryHours: 12,
  };

  if (settings) {
    await prisma.systemSetting.update({
      where: { id: settings.id },
      data: settingsData,
    });
  } else {
    await prisma.systemSetting.create({ data: settingsData });
  }

  const footerColumns = [
    {
      title: 'MOONKID',
      links: [
        ['Về chúng tôi', '/about'],
        ['Hệ thống cửa hàng', '/stores'],
      ],
    },
    {
      title: 'HỖ TRỢ',
      links: [
        ['Hướng dẫn chọn size', '/size-guide'],
        ['Giao hàng và đổi trả', '/shipping-returns'],
        ['Theo dõi đơn hàng', '/orders/track'],
      ],
    },
    {
      title: 'CHÍNH SÁCH',
      links: [
        ['Bảo mật', '/privacy'],
        ['Điều khoản sử dụng', '/terms'],
      ],
    },
  ];

  if ((await prisma.footerColumn.count()) === 0) {
    for (const [columnIndex, column] of footerColumns.entries()) {
      await prisma.footerColumn.create({
        data: {
          title: column.title,
          sortOrder: columnIndex + 1,
          links: {
            create: column.links.map(([label, url], linkIndex) => ({
              label,
              url,
              sortOrder: linkIndex + 1,
            })),
          },
        },
      });
    }
  }

  console.log(`MoonKid seed complete. Admin: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
