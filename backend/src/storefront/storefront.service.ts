import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { API_LIMITS } from '../common/constants/app.constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReviewsQueryDto,
  StorefrontProductQueryDto,
  StorefrontProductSort,
} from './dto/storefront.dto';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    tags: { include: { tag: true } };
    images: true;
    variants: {
      include: {
        images: true;
        options: { include: { optionValue: { include: { optionType: true } } } };
      };
    };
    reviews: true;
  };
}>;

@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  async getHome() {
    const now = new Date();
    const [banners, categories, bestSellers, newArrivals] = await Promise.all([
      this.prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 8,
      }),
      this.findProductCards({}, StorefrontProductSort.BEST_SELLER, 1, 8),
      this.findProductCards({ isFeatured: true }, StorefrontProductSort.NEWEST, 1, 8),
    ]);

    return {
      banners,
      featuredCategories: categories,
      bestSellers: bestSellers.items,
      newArrivals: newArrivals.items,
    };
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const byParent = new Map<string | null, typeof categories>();
    for (const category of categories) {
      const key = category.parentId ?? null;
      byParent.set(key, [...(byParent.get(key) ?? []), category]);
    }

    const build = (parentId: string | null): unknown[] =>
      (byParent.get(parentId) ?? []).map((category) => ({
        ...category,
        children: build(category.id),
      }));

    return build(null);
  }

  async getProducts(query: StorefrontProductQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 24, API_LIMITS.MAX_PAGE_LIMIT);
    const where = await this.buildProductWhere(query);
    return this.findProductCards(where, query.sort ?? StorefrontProductSort.NEWEST, page, limit);
  }

  async getProductFilters() {
    const [categories, tags, optionValues, variants] = await Promise.all([
      this.getCategories(),
      this.prisma.tag.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.optionValue.findMany({
        where: {
          variantOptions: {
            some: {
              variant: { isActive: true, product: { isActive: true } },
            },
          },
        },
        include: { optionType: true },
        orderBy: [{ optionType: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      }),
      this.prisma.productVariant.findMany({
        where: { isActive: true, product: { isActive: true } },
        select: { price: true },
      }),
    ]);

    const sizes = optionValues
      .filter((value) => this.isSizeOption(value.optionType.name))
      .map((value) => this.mapOptionValue(value));
    const colors = optionValues
      .filter((value) => this.isColorOption(value.optionType.name))
      .map((value) => this.mapOptionValue(value));
    const prices = variants.map((variant) => Number(variant.price));

    return {
      categories,
      tags,
      sizes: this.uniqueById(sizes),
      colors: this.uniqueById(colors),
      priceRange: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
      },
    };
  }

  async getProductDetail(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        variants: { some: { isActive: true } },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: [{ sortOrder: 'asc' }] },
        optionTypes: {
          include: { values: { orderBy: [{ sortOrder: 'asc' }] } },
          orderBy: [{ sortOrder: 'asc' }],
        },
        variants: {
          where: { isActive: true },
          include: {
            images: true,
            options: {
              include: { optionValue: { include: { optionType: true } } },
            },
          },
          orderBy: [{ createdAt: 'asc' }],
        },
        reviews: { where: { isApproved: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const reviews = this.summarizeReviews(product.reviews);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      tags: product.tags.map((item) => item.tag),
      description: product.description,
      material: product.material,
      careInstruction: product.careInstruction,
      sizeChartUrl: product.sizeChartUrl,
      images: product.images,
      optionTypes: product.optionTypes,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: Number(variant.price),
        comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
        stock: variant.stock,
        stockReserved: variant.stockReserved,
        stockAvailable: Math.max(variant.stock - variant.stockReserved, 0),
        image: variant.images[0]?.url ?? null,
        options: variant.options.map((option) => ({
          id: option.optionValue.id,
          optionTypeId: option.optionValue.optionTypeId,
          optionTypeName: option.optionValue.optionType.name,
          value: option.optionValue.value,
          displayName: option.optionValue.displayName,
          colorHex: option.optionValue.colorHex,
        })),
      })),
      reviews,
    };
  }

  async getProductReviews(slug: string, query: ReviewsQueryDto) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, API_LIMITS.MAX_PAGE_LIMIT);
    const where = { productId: product.id, isApproved: true };
    const [total, items] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async buildProductWhere(query: StorefrontProductQueryDto) {
    const categoryIds = query.category ? await this.resolveCategoryIds(query.category) : undefined;
    const sizes = this.splitCsv(query.sizes);
    const colors = this.splitCsv(query.colors);
    const tags = this.splitCsv(query.tag);

    const variantFilters: Prisma.ProductVariantWhereInput[] = [{ isActive: true }];
    if (query.minPrice !== undefined) variantFilters.push({ price: { gte: query.minPrice } });
    if (query.maxPrice !== undefined) variantFilters.push({ price: { lte: query.maxPrice } });
    if (sizes.length > 0) {
      variantFilters.push({
        options: {
          some: {
            optionValue: {
              value: { in: sizes, mode: 'insensitive' },
              optionType: { name: { contains: 'size', mode: 'insensitive' } },
            },
          },
        },
      });
    }
    if (colors.length > 0) {
      variantFilters.push({
        options: {
          some: {
            optionValue: {
              value: { in: colors, mode: 'insensitive' },
              optionType: { name: { contains: 'màu', mode: 'insensitive' } },
            },
          },
        },
      });
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      variants: { some: { AND: variantFilters } },
    };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (categoryIds?.length) {
      where.categoryId = { in: categoryIds };
    }
    if (tags.length > 0) {
      where.tags = { some: { tag: { slug: { in: tags } } } };
    }

    return where;
  }

  private async findProductCards(
    where: Prisma.ProductWhereInput,
    sort: StorefrontProductSort,
    page: number,
    limit: number,
  ) {
    const orderBy = this.getProductOrderBy(sort);
    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          tags: { include: { tag: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          variants: {
            where: { isActive: true },
            include: {
              images: true,
              options: { include: { optionValue: { include: { optionType: true } } } },
            },
          },
          reviews: { where: { isApproved: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items = products.map((product) => this.toProductCard(product));
    this.sortProductCards(items, sort);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private toProductCard(product: ProductWithRelations) {
    const prices = product.variants.map((variant) => Number(variant.price));
    const comparePrices = product.variants
      .map((variant) => (variant.comparePrice ? Number(variant.comparePrice) : null))
      .filter((price): price is number => price !== null);
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const comparePriceMin = comparePrices.length ? Math.min(...comparePrices) : null;
    const discountPercent =
      comparePriceMin && comparePriceMin > priceMin
        ? Math.round(((comparePriceMin - priceMin) / comparePriceMin) * 100)
        : 0;
    const reviewSummary = this.summarizeReviews(product.reviews);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      tags: product.tags.map((item) => item.tag),
      primaryImage:
        product.images.find((image) => image.isPrimary)?.url ??
        product.images[0]?.url ??
        product.variants[0]?.images[0]?.url ??
        null,
      priceMin,
      comparePriceMin,
      discountPercent,
      isNew: Date.now() - product.createdAt.getTime() < 1000 * 60 * 60 * 24 * 30,
      isSoldOut: product.variants.every(
        (variant) => variant.stock - variant.stockReserved <= 0,
      ),
      ratingAverage: reviewSummary.ratingAverage,
      reviewCount: reviewSummary.reviewCount,
    };
  }

  private summarizeReviews(reviews: Array<{ rating: number }>) {
    const reviewCount = reviews.length;
    const ratingAverage = reviewCount
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) /
        10
      : 0;
    return { reviewCount, ratingAverage };
  }

  private getProductOrderBy(sort: StorefrontProductSort): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case StorefrontProductSort.PRICE_ASC:
      case StorefrontProductSort.PRICE_DESC:
      case StorefrontProductSort.BEST_SELLER:
      case StorefrontProductSort.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private sortProductCards(
    items: ReturnType<StorefrontService['toProductCard']>[],
    sort: StorefrontProductSort,
  ) {
    if (sort === StorefrontProductSort.PRICE_ASC) {
      items.sort((left, right) => left.priceMin - right.priceMin);
    }
    if (sort === StorefrontProductSort.PRICE_DESC) {
      items.sort((left, right) => right.priceMin - left.priceMin);
    }
  }

  private async resolveCategoryIds(categorySlug: string) {
    const root = await this.prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!root) return [];

    const all = await this.prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, parentId: true },
    });
    const result = new Set<string>([root.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const category of all) {
        if (category.parentId && result.has(category.parentId) && !result.has(category.id)) {
          result.add(category.id);
          changed = true;
        }
      }
    }
    return [...result];
  }

  private splitCsv(value?: string) {
    return value
      ? value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  private isSizeOption(name: string) {
    return ['size', 'kích', 'kich'].some((needle) => name.toLowerCase().includes(needle));
  }

  private isColorOption(name: string) {
    return ['color', 'màu', 'mau'].some((needle) => name.toLowerCase().includes(needle));
  }

  private mapOptionValue(value: {
    id: string;
    value: string;
    displayName: string | null;
    colorHex: string | null;
  }) {
    return {
      id: value.id,
      value: value.value,
      displayName: value.displayName,
      colorHex: value.colorHex,
    };
  }

  private uniqueById<T extends { id: string }>(items: T[]) {
    return [...new Map(items.map((item) => [item.id, item])).values()];
  }
}
