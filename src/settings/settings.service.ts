import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async onModuleInit() {
    const count = await this.settingsRepository.count();
    if (count === 0) {
      await this.settingsRepository.save({});
    }
  }

  async getSettings() {
    return this.settingsRepository.findOne({ where: { id: 1 } });
  }

  async updateSettings(data: Partial<Settings>) {
    await this.settingsRepository.update(1, data);
    return this.getSettings();
  }
}
