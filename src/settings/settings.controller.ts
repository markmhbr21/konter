import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Settings } from './settings.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateSettings(@Body() data: Partial<Settings>) {
    return this.settingsService.updateSettings(data);
  }
}
