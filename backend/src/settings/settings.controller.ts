import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import {
  UpdateSystemSettingDto,
  CreateFooterColumnDto,
  UpdateFooterColumnDto,
  CreateFooterLinkDto,
  UpdateFooterLinkDto,
} from './dto/settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/settings
   * Public route to get shop details & active footer structure
   */
  @Get()
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  /**
   * GET /api/settings/admin
   * Admin-only route to get raw configurations including shipping fees and expiry policies
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminSettings() {
    return this.settingsService.getAdminSettings();
  }

  /**
   * PATCH /api/settings
   * Admin-only route to update general configurations
   */
  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateSettings(@Body() dto: UpdateSystemSettingDto) {
    return this.settingsService.updateSettings(dto);
  }

  // ============================================================
  // FOOTER COLUMNS MANAGEMENT (ADMIN)
  // ============================================================

  @Get('columns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getFooterColumns() {
    return this.settingsService.getFooterColumns();
  }

  @Post('columns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createFooterColumn(@Body() dto: CreateFooterColumnDto) {
    return this.settingsService.createFooterColumn(dto);
  }

  @Patch('columns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateFooterColumn(@Param('id') id: string, @Body() dto: UpdateFooterColumnDto) {
    return this.settingsService.updateFooterColumn(id, dto);
  }

  @Delete('columns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFooterColumn(@Param('id') id: string) {
    return this.settingsService.deleteFooterColumn(id);
  }

  // ============================================================
  // FOOTER LINKS MANAGEMENT (ADMIN)
  // ============================================================

  @Post('links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createFooterLink(@Body() dto: CreateFooterLinkDto) {
    return this.settingsService.createFooterLink(dto);
  }

  @Patch('links/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateFooterLink(@Param('id') id: string, @Body() dto: UpdateFooterLinkDto) {
    return this.settingsService.updateFooterLink(id, dto);
  }

  @Delete('links/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFooterLink(@Param('id') id: string) {
    return this.settingsService.deleteFooterLink(id);
  }
}
