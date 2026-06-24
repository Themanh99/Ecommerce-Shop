import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AdminCatalogService } from './admin-catalog.service';
import {
  CreateBannerDto,
  CreateCategoryDto,
  CreateProductDto,
  CreateTagDto,
  ListAdminCatalogDto,
  UpdateBannerDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateTagDto,
} from './dto/admin-catalog.dto';

@Controller('admin/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SALE')
export class AdminCatalogController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Post('categories')
  @Roles('ADMIN')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalog.createCategory(dto);
  }

  @Patch('categories/:id')
  @Roles('ADMIN')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalog.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('ADMIN')
  deleteCategory(@Param('id') id: string) {
    return this.catalog.deleteCategory(id);
  }

  @Get('tags')
  listTags() {
    return this.catalog.listTags();
  }

  @Post('tags')
  @Roles('ADMIN')
  createTag(@Body() dto: CreateTagDto) {
    return this.catalog.createTag(dto);
  }

  @Patch('tags/:id')
  @Roles('ADMIN')
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.catalog.updateTag(id, dto);
  }

  @Delete('tags/:id')
  @Roles('ADMIN')
  deleteTag(@Param('id') id: string) {
    return this.catalog.deleteTag(id);
  }

  @Get('banners')
  @Roles('ADMIN')
  listBanners() {
    return this.catalog.listBanners();
  }

  @Post('banners')
  @Roles('ADMIN')
  createBanner(@Body() dto: CreateBannerDto) {
    return this.catalog.createBanner(dto);
  }

  @Patch('banners/:id')
  @Roles('ADMIN')
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.catalog.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @Roles('ADMIN')
  deleteBanner(@Param('id') id: string) {
    return this.catalog.deleteBanner(id);
  }

  @Get('products')
  listProducts(@Query() query: ListAdminCatalogDto) {
    return this.catalog.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Post('products')
  createProduct(@GetUser('sub') userId: string, @Body() dto: CreateProductDto) {
    return this.catalog.createProduct(userId, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @GetUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalog.updateProduct(userId, id, dto);
  }

  @Delete('products/:id')
  @Roles('ADMIN')
  deleteProduct(@Param('id') id: string) {
    return this.catalog.deleteProduct(id);
  }
}
