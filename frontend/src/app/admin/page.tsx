'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Form, Input, InputNumber, Layout, Select, Space, Switch, Table, Tabs, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminCatalogApi, type AdminBannerInput, type AdminCategoryInput, type AdminProductInput, type AdminTagInput } from '@/lib/adminCatalog';
import type { BannerItem, CategoryNode, ProductCardItem, StorefrontTag } from '@/lib/storefront';
import { formatPrice } from '@/lib/storefront';
import { useAuthStore } from '@/stores/authStore';

const { Content } = Layout;

export default function AdminDashboard() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManageMasterData = user?.role === 'ADMIN';

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminCatalogApi.categories,
  });
  const tagsQuery = useQuery({ queryKey: ['admin-tags'], queryFn: adminCatalogApi.tags });
  const bannersQuery = useQuery({ queryKey: ['admin-banners'], queryFn: adminCatalogApi.banners });
  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminCatalogApi.products,
  });

  const categoryOptions = useMemo(
    () =>
      flattenCategories(categoriesQuery.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoriesQuery.data],
  );
  const tagOptions = useMemo(
    () => (tagsQuery.data ?? []).map((tag) => ({ label: tag.name, value: tag.id })),
    [tagsQuery.data],
  );

  const refreshCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    void queryClient.invalidateQueries({ queryKey: ['storefront-home'] });
    void queryClient.invalidateQueries({ queryKey: ['storefront-products'] });
    void queryClient.invalidateQueries({ queryKey: ['storefront-filters'] });
  };

  const categoryMutation = useMutation({
    mutationFn: adminCatalogApi.createCategory,
    onSuccess: () => {
      message.success('Đã tạo danh mục.');
      refreshCatalog();
    },
  });
  const tagMutation = useMutation({
    mutationFn: adminCatalogApi.createTag,
    onSuccess: () => {
      message.success('Đã tạo tag.');
      refreshCatalog();
    },
  });
  const bannerMutation = useMutation({
    mutationFn: adminCatalogApi.createBanner,
    onSuccess: () => {
      message.success('Đã tạo banner.');
      refreshCatalog();
    },
  });
  const productMutation = useMutation({
    mutationFn: adminCatalogApi.createProduct,
    onSuccess: () => {
      message.success('Đã tạo sản phẩm.');
      refreshCatalog();
    },
  });

  const productColumns: ColumnsType<ProductCardItem> = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Giá từ',
      dataIndex: 'priceMin',
      key: 'priceMin',
      render: (value: number) => formatPrice(value),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (record.isSoldOut ? 'Hết hàng' : 'Đang bán'),
    },
  ];
  const categoryColumns: ColumnsType<CategoryNode> = [
    { title: 'Danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Thứ tự', dataIndex: 'sortOrder', key: 'sortOrder' },
  ];
  const tagColumns: ColumnsType<StorefrontTag> = [
    { title: 'Tag', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Màu', dataIndex: 'color', key: 'color' },
  ];
  const bannerColumns: ColumnsType<BannerItem> = [
    { title: 'Banner', dataIndex: 'title', key: 'title' },
    { title: 'Vị trí', dataIndex: 'position', key: 'position' },
    { title: 'Link', dataIndex: 'linkUrl', key: 'linkUrl' },
  ];

  return (
    <Layout className="admin-shell">
      <Content className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">MoonKid Admin</p>
            <Typography.Title level={2}>Quản trị dữ liệu storefront</Typography.Title>
            <Typography.Text>
              Nhập dữ liệu cơ bản ở đây, home/shop/detail sẽ đọc qua API storefront ngay.
            </Typography.Text>
          </div>
          <div className="admin-user-pill">{user?.role}</div>
        </div>

        <Tabs
          items={[
            {
              key: 'products',
              label: 'Sản phẩm',
              children: (
                <Space direction="vertical" size="large" className="admin-tab">
                  <Card title="Tạo sản phẩm nhanh">
                    <Form
                      layout="vertical"
                      onFinish={(values) =>
                        productMutation.mutate(buildProductPayload(values as ProductQuickForm))
                      }
                      initialValues={{
                        price: 189000,
                        stock: 20,
                        color: 'Kem',
                        size: '3-5 tuổi',
                        isActive: true,
                        isFeatured: true,
                      }}
                    >
                      <div className="admin-form-grid">
                        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                          <Input placeholder="Váy cotton MoonKid" />
                        </Form.Item>
                        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                          <Input placeholder="vay-cotton-moonkid" />
                        </Form.Item>
                        <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                          <Select options={categoryOptions} placeholder="Chọn danh mục" />
                        </Form.Item>
                        <Form.Item name="tagIds" label="Tag">
                          <Select mode="multiple" options={tagOptions} placeholder="Chọn tag" />
                        </Form.Item>
                        <Form.Item name="imageUrl" label="Ảnh URL" rules={[{ required: true }]}>
                          <Input placeholder="https://..." />
                        </Form.Item>
                        <Form.Item name="sku" label="SKU">
                          <Input placeholder="MOONKID-001" />
                        </Form.Item>
                        <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                          <InputNumber min={0} className="full-width" />
                        </Form.Item>
                        <Form.Item name="comparePrice" label="Giá gốc">
                          <InputNumber min={0} className="full-width" />
                        </Form.Item>
                        <Form.Item name="stock" label="Tồn kho" rules={[{ required: true }]}>
                          <InputNumber min={0} className="full-width" />
                        </Form.Item>
                        <Form.Item name="color" label="Màu">
                          <Input />
                        </Form.Item>
                        <Form.Item name="size" label="Size">
                          <Input />
                        </Form.Item>
                        <Form.Item name="material" label="Chất liệu">
                          <Input placeholder="Cotton 100%" />
                        </Form.Item>
                        <Form.Item name="shortDescription" label="Mô tả ngắn">
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </div>
                      <Button type="primary" htmlType="submit" loading={productMutation.isPending}>
                        Tạo sản phẩm
                      </Button>
                    </Form>
                  </Card>
                  <Card title="Sản phẩm hiện có">
                    <Table
                      rowKey="id"
                      columns={productColumns}
                      dataSource={productsQuery.data?.items ?? []}
                      loading={productsQuery.isLoading}
                      pagination={false}
                    />
                  </Card>
                </Space>
              ),
            },
            {
              key: 'categories',
              label: 'Danh mục',
              children: (
                <MasterDataPanel<AdminCategoryInput, CategoryNode>
                  disabled={!canManageMasterData}
                  title="Tạo danh mục"
                  note="Chỉ ADMIN được quản lý danh mục."
                  loading={categoryMutation.isPending}
                  columns={categoryColumns}
                  data={flattenCategories(categoriesQuery.data ?? [])}
                  onFinish={(values) => categoryMutation.mutate(values)}
                  fields={
                    <>
                      <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
                        <Input placeholder="Bé gái" />
                      </Form.Item>
                      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                        <Input placeholder="be-gai" />
                      </Form.Item>
                      <Form.Item name="imageUrl" label="Ảnh URL">
                        <Input placeholder="https://..." />
                      </Form.Item>
                      <Form.Item name="sortOrder" label="Thứ tự" initialValue={0}>
                        <InputNumber className="full-width" />
                      </Form.Item>
                      <Form.Item name="isFeatured" label="Nổi bật ở home" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </>
                  }
                />
              ),
            },
            {
              key: 'tags',
              label: 'Tag',
              children: (
                <MasterDataPanel<AdminTagInput, StorefrontTag>
                  disabled={!canManageMasterData}
                  title="Tạo tag"
                  note="Tag dùng cho nhu cầu như đi học, sơ sinh, bé trai..."
                  loading={tagMutation.isPending}
                  columns={tagColumns}
                  data={tagsQuery.data ?? []}
                  onFinish={(values) => tagMutation.mutate(values)}
                  fields={
                    <>
                      <Form.Item name="name" label="Tên tag" rules={[{ required: true }]}>
                        <Input placeholder="Đi học" />
                      </Form.Item>
                      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
                        <Input placeholder="di-hoc" />
                      </Form.Item>
                      <Form.Item name="color" label="Màu hiển thị">
                        <Input placeholder="#7b61ff" />
                      </Form.Item>
                    </>
                  }
                />
              ),
            },
            {
              key: 'banners',
              label: 'Banner',
              children: (
                <MasterDataPanel<AdminBannerInput, BannerItem>
                  disabled={!canManageMasterData}
                  title="Tạo banner"
                  note="Banner active sẽ hiển thị ở home."
                  loading={bannerMutation.isPending}
                  columns={bannerColumns}
                  data={bannersQuery.data ?? []}
                  onFinish={(values) => bannerMutation.mutate({ position: 'home_hero', isActive: true, ...values })}
                  fields={
                    <>
                      <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                        <Input placeholder="Bộ sưu tập hè cho bé" />
                      </Form.Item>
                      <Form.Item name="subtitle" label="Mô tả">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item name="imageUrl" label="Ảnh URL" rules={[{ required: true }]}>
                        <Input placeholder="https://..." />
                      </Form.Item>
                      <Form.Item name="linkUrl" label="Link">
                        <Input placeholder="/shop" />
                      </Form.Item>
                      <Form.Item name="buttonText" label="Nút CTA">
                        <Input placeholder="Mua sắm ngay" />
                      </Form.Item>
                    </>
                  }
                />
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
}

type ProductQuickForm = {
  name: string;
  slug: string;
  categoryId: string;
  tagIds?: string[];
  imageUrl: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  color?: string;
  size?: string;
  material?: string;
  shortDescription?: string;
  isFeatured?: boolean;
};

function buildProductPayload(values: ProductQuickForm): AdminProductInput {
  const color = values.color || 'Mặc định';
  const size = values.size || 'Freesize';

  return {
    name: values.name,
    slug: values.slug,
    shortDescription: values.shortDescription,
    description: values.shortDescription,
    material: values.material,
    categoryId: values.categoryId,
    tagIds: values.tagIds ?? [],
    isActive: true,
    isFeatured: values.isFeatured ?? false,
    images: [{ url: values.imageUrl, alt: values.name, isPrimary: true, sortOrder: 0 }],
    optionTypes: [
      {
        name: 'Màu sắc',
        displayName: 'Màu sắc',
        sortOrder: 0,
        values: [{ value: color, displayValue: color, sortOrder: 0 }],
      },
      {
        name: 'Kích cỡ',
        displayName: 'Kích cỡ',
        sortOrder: 1,
        values: [{ value: size, displayValue: size, sortOrder: 0 }],
      },
    ],
    variants: [
      {
        sku: values.sku || values.slug.toUpperCase().replaceAll('-', '_'),
        price: values.price,
        comparePrice: values.comparePrice,
        stock: values.stock,
        imageUrl: values.imageUrl,
        isActive: true,
        options: [
          { optionTypeName: 'Màu sắc', value: color },
          { optionTypeName: 'Kích cỡ', value: size },
        ],
      },
    ],
  };
}

function MasterDataPanel<TPayload extends object, TRow extends { id: string }>({
  disabled,
  title,
  note,
  loading,
  fields,
  data,
  columns,
  onFinish,
}: {
  disabled: boolean;
  title: string;
  note: string;
  loading: boolean;
  fields: ReactNode;
  data: TRow[];
  columns: ColumnsType<TRow>;
  onFinish: (values: TPayload) => void;
}) {
  return (
    <Space direction="vertical" size="large" className="admin-tab">
      <Card title={title}>
        <Typography.Paragraph type={disabled ? 'danger' : 'secondary'}>{note}</Typography.Paragraph>
        <Form<TPayload> layout="vertical" disabled={disabled} onFinish={onFinish}>
          <div className="admin-form-grid">{fields}</div>
          <Button type="primary" htmlType="submit" loading={loading} disabled={disabled}>
            Lưu
          </Button>
        </Form>
      </Card>
      <Card title="Dữ liệu hiện có">
        <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 8 }} />
      </Card>
    </Space>
  );
}

function flattenCategories(categories: CategoryNode[]): CategoryNode[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children ?? []),
  ]);
}
