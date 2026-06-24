import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { API_LIMITS } from '../common/constants/app.constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBannerDto,
  CreateCategoryDto,
  CreateProductDto,
  CreateTagDto,
  ListAdminCatalogDto,
  ProductOptionTypeInputDto,
  ProductVariantInputDto,
  UpdateBannerDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateTagDto,
} from './dto/admin-catalog.dto';

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.prisma.category.update({ where: { id }, data: { isActive: false } });
    return { message: 'Đã ẩn danh mục' };
  }

  listTags() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  createTag(dto: CreateTagDto) {
    return this.prisma.tag.create({ data: dto });
  }

  updateTag(id: string, dto: UpdateTagDto) {
    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { message: 'Đã xóa tag' };
  }

  listBanners() {
    return this.prisma.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: this.mapCreateBannerDto(dto) });
  }

  updateBanner(id: string, dto: UpdateBannerDto) {
    return this.prisma.banner.update({ where: { id }, data: this.mapUpdateBannerDto(dto) });
  }

  async deleteBanner(id: string) {
    await this.prisma.banner.update({ where: { id }, data: { isActive: false } });
    return { message: 'Đã ẩn banner' };
  }

  async listProducts(query: ListAdminCatalogDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, API_LIMITS.MAX_PAGE_LIMIT);
    const where: Prisma.ProductWhereInput = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { slug: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          variants: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((product) => ({
        ...product,
        totalStock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
        variantCount: product.variants.length,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: [{ sortOrder: 'asc' }] },
        optionTypes: { include: { values: true }, orderBy: { sortOrder: 'asc' } },
        variants: {
          include: {
            options: { include: { optionValue: { include: { optionType: true } } } },
          },
        },
      },
    });
  }

  createProduct(userId: string, dto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertCategoryExists(tx, dto.categoryId);
      this.assertProductInput(dto.optionTypes, dto.variants);

      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          categoryId: dto.categoryId,
          description: dto.description,
          material: dto.material,
          careInstruction: dto.careInstruction,
          sizeChartUrl: dto.sizeChartUrl,
          isActive: dto.isActive ?? true,
          isFeatured: dto.isFeatured ?? false,
          createdById: userId,
          tags: dto.tagIds?.length
            ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
            : undefined,
          images: {
            create: dto.images.map((image, index) => ({
              url: image.url,
              publicId: image.url,
              altText: image.altText,
              isPrimary: image.isPrimary ?? index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          },
        },
      });

      const optionValueIds = await this.createOptionTypes(tx, product.id, dto.optionTypes);
      await this.createVariants(tx, product.id, dto.variants, optionValueIds);
      return this.getProduct(product.id);
    });
  }

  updateProduct(userId: string, id: string, dto: UpdateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');
      if (dto.categoryId) await this.assertCategoryExists(tx, dto.categoryId);

      if (dto.optionTypes && dto.variants) {
        this.assertProductInput(dto.optionTypes, dto.variants);
      }

      await tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          categoryId: dto.categoryId,
          description: dto.description,
          material: dto.material,
          careInstruction: dto.careInstruction,
          sizeChartUrl: dto.sizeChartUrl,
          isActive: dto.isActive,
          isFeatured: dto.isFeatured,
          createdById: userId,
        },
      });

      if (dto.tagIds) {
        await tx.productTag.deleteMany({ where: { productId: id } });
        if (dto.tagIds.length > 0) {
          await tx.productTag.createMany({
            data: dto.tagIds.map((tagId) => ({ productId: id, tagId })),
          });
        }
      }

      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((image, index) => ({
              productId: id,
              url: image.url,
              publicId: image.url,
              altText: image.altText,
              isPrimary: image.isPrimary ?? index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          });
        }
      }

      if (dto.optionTypes && dto.variants) {
        await tx.variantOption.deleteMany({ where: { variant: { productId: id } } });
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.optionValue.deleteMany({ where: { optionType: { productId: id } } });
        await tx.optionType.deleteMany({ where: { productId: id } });
        const optionValueIds = await this.createOptionTypes(tx, id, dto.optionTypes);
        await this.createVariants(tx, id, dto.variants, optionValueIds);
      }

      return this.getProduct(id);
    });
  }

  async deleteProduct(id: string) {
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { message: 'Đã ẩn sản phẩm' };
  }

  private async assertCategoryExists(
    tx: Prisma.TransactionClient,
    categoryId: string,
  ) {
    const category = await tx.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Danh mục không tồn tại');
  }

  private assertProductInput(
    optionTypes: ProductOptionTypeInputDto[],
    variants: ProductVariantInputDto[],
  ) {
    const optionNames = new Set(optionTypes.map((option) => option.name));
    if (optionTypes.length === 0) {
      throw new BadRequestException('Sản phẩm cần ít nhất một nhóm option');
    }
    if (variants.length === 0) {
      throw new BadRequestException('Sản phẩm cần ít nhất một biến thể');
    }
    for (const variant of variants) {
      for (const option of variant.options) {
        if (!optionNames.has(option.optionTypeName)) {
          throw new BadRequestException(`Option ${option.optionTypeName} không tồn tại`);
        }
      }
    }
  }

  private async createOptionTypes(
    tx: Prisma.TransactionClient,
    productId: string,
    optionTypes: ProductOptionTypeInputDto[],
  ) {
    const optionValueIds = new Map<string, string>();
    for (const [typeIndex, optionType] of optionTypes.entries()) {
      const createdType = await tx.optionType.create({
        data: {
          productId,
          name: optionType.name,
          sortOrder: typeIndex,
        },
      });
      for (const [valueIndex, value] of optionType.values.entries()) {
        const createdValue = await tx.optionValue.create({
          data: {
            optionTypeId: createdType.id,
            value: value.value,
            displayName: value.displayName,
            colorHex: value.colorHex,
            sortOrder: valueIndex,
          },
        });
        optionValueIds.set(this.optionKey(optionType.name, value.value), createdValue.id);
      }
    }
    return optionValueIds;
  }

  private async createVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    variants: ProductVariantInputDto[],
    optionValueIds: Map<string, string>,
  ) {
    for (const variant of variants) {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId,
          sku: variant.sku,
          price: variant.price,
          comparePrice: variant.comparePrice,
          stock: variant.stock,
          barcode: variant.barcode,
        },
      });
      await tx.variantOption.createMany({
        data: variant.options.map((option) => {
          const optionValueId = optionValueIds.get(
            this.optionKey(option.optionTypeName, option.value),
          );
          if (!optionValueId) {
            throw new BadRequestException(
              `Giá trị ${option.optionTypeName}/${option.value} không tồn tại`,
            );
          }
          return { variantId: createdVariant.id, optionValueId };
        }),
      });
    }
  }

  private optionKey(optionTypeName: string, value: string) {
    return `${optionTypeName.trim().toLowerCase()}::${value.trim().toLowerCase()}`;
  }

  private mapCreateBannerDto(dto: CreateBannerDto): Prisma.BannerCreateInput {
    return {
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : dto.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : dto.endsAt,
    };
  }

  private mapUpdateBannerDto(dto: UpdateBannerDto): Prisma.BannerUpdateInput {
    return {
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : dto.startsAt,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : dto.endsAt,
    };
  }
}
