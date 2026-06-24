import { Controller, Get, Param, Query } from '@nestjs/common';
import { ReviewsQueryDto, StorefrontProductQueryDto } from './dto/storefront.dto';
import { StorefrontService } from './storefront.service';

@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get('home')
  getHome() {
    return this.storefront.getHome();
  }

  @Get('categories')
  getCategories() {
    return this.storefront.getCategories();
  }

  @Get('products/filters')
  getProductFilters() {
    return this.storefront.getProductFilters();
  }

  @Get('products')
  getProducts(@Query() query: StorefrontProductQueryDto) {
    return this.storefront.getProducts(query);
  }

  @Get('products/:slug/reviews')
  getProductReviews(@Param('slug') slug: string, @Query() query: ReviewsQueryDto) {
    return this.storefront.getProductReviews(slug, query);
  }

  @Get('products/:slug')
  getProductDetail(@Param('slug') slug: string) {
    return this.storefront.getProductDetail(slug);
  }
}
