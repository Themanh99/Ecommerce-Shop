import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import {
  UpdateSystemSettingDto,
  CreateFooterColumnDto,
  UpdateFooterColumnDto,
  CreateFooterLinkDto,
  UpdateFooterLinkDto,
} from './dto/settings.dto';

const PUBLIC_SETTINGS_CACHE_KEY = 'cache:settings:public';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  /**
   * Helper to invalidate the public settings cache
   */
  private async clearCache() {
    await this.redis.del(PUBLIC_SETTINGS_CACHE_KEY);
  }

  /**
   * Get public website configuration (cached in Redis)
   * Excludes internal fields like orderExpiryHours for general store visitors
   */
  async getPublicSettings() {
    const cached = await this.redis.get(PUBLIC_SETTINGS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get active settings (or create default if none exists yet)
    let setting = await this.prisma.systemSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.systemSetting.create({
        data: {
          shopName: 'MoonKid',
          shippingFeeDefault: 30000,
          freeShippingThreshold: 500000,
          orderExpiryHours: 12,
        },
      });
    }

    // Get active footer layout
    const footerColumns = await this.prisma.footerColumn.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    const publicData = {
      shopName: setting.shopName,
      logoUrl: setting.logoUrl,
      faviconUrl: setting.faviconUrl,
      description: setting.description,
      phone: setting.phone,
      email: setting.email,
      address: setting.address,
      socials: {
        twitter: setting.twitterUrl,
        facebook: setting.facebookUrl,
        instagram: setting.instagramUrl,
        github: setting.githubUrl,
        youtube: setting.youtubeUrl,
      },
      shipping: {
        defaultFee: Number(setting.shippingFeeDefault),
        freeThreshold: Number(setting.freeShippingThreshold),
      },
      footer: footerColumns.map((col) => ({
        id: col.id,
        title: col.title,
        links: col.links.map((link) => ({
          id: link.id,
          label: link.label,
          url: link.url,
        })),
      })),
    };

    // Cache in Redis for 1 day (or until invalidated)
    await this.redis.set(
      PUBLIC_SETTINGS_CACHE_KEY,
      JSON.stringify(publicData),
      'EX',
      86400, // 24 hours
    );

    return publicData;
  }

  /**
   * Get raw system settings for Admin
   */
  async getAdminSettings() {
    let setting = await this.prisma.systemSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.systemSetting.create({
        data: {
          shopName: 'MoonKid',
          shippingFeeDefault: 30000,
          freeShippingThreshold: 500000,
          orderExpiryHours: 12,
        },
      });
    }
    return setting;
  }

  /**
   * Update system settings
   */
  async updateSettings(dto: UpdateSystemSettingDto) {
    let setting = await this.prisma.systemSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.systemSetting.create({
        data: {
          shopName: dto.shopName ?? 'MoonKid',
          ...dto,
        },
      });
    } else {
      setting = await this.prisma.systemSetting.update({
        where: { id: setting.id },
        data: dto,
      });
    }

    await this.clearCache();
    return setting;
  }

  // ============================================================
  // FOOTER COLUMNS
  // ============================================================

  async getFooterColumns() {
    return this.prisma.footerColumn.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        links: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async createFooterColumn(dto: CreateFooterColumnDto) {
    const col = await this.prisma.footerColumn.create({
      data: dto,
    });
    await this.clearCache();
    return col;
  }

  async updateFooterColumn(id: string, dto: UpdateFooterColumnDto) {
    const col = await this.prisma.footerColumn.findUnique({
      where: { id },
    });
    if (!col) throw new NotFoundException('Footer column not found');

    const updated = await this.prisma.footerColumn.update({
      where: { id },
      data: dto,
    });
    await this.clearCache();
    return updated;
  }

  async deleteFooterColumn(id: string) {
    const col = await this.prisma.footerColumn.findUnique({
      where: { id },
    });
    if (!col) throw new NotFoundException('Footer column not found');

    await this.prisma.footerColumn.delete({
      where: { id },
    });
    await this.clearCache();
    return { success: true };
  }

  // ============================================================
  // FOOTER LINKS
  // ============================================================

  async createFooterLink(dto: CreateFooterLinkDto) {
    const col = await this.prisma.footerColumn.findUnique({
      where: { id: dto.footerColumnId },
    });
    if (!col) throw new NotFoundException('Footer column not found');

    const link = await this.prisma.footerLink.create({
      data: dto,
    });
    await this.clearCache();
    return link;
  }

  async updateFooterLink(id: string, dto: UpdateFooterLinkDto) {
    const link = await this.prisma.footerLink.findUnique({
      where: { id },
    });
    if (!link) throw new NotFoundException('Footer link not found');

    const updated = await this.prisma.footerLink.update({
      where: { id },
      data: dto,
    });
    await this.clearCache();
    return updated;
  }

  async deleteFooterLink(id: string) {
    const link = await this.prisma.footerLink.findUnique({
      where: { id },
    });
    if (!link) throw new NotFoundException('Footer link not found');

    await this.prisma.footerLink.delete({
      where: { id },
    });
    await this.clearCache();
    return { success: true };
  }
}
