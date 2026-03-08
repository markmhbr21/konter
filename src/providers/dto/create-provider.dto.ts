import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProviderType } from '../entities/provider.entity';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProviderType)
  @IsNotEmpty()
  type: ProviderType;

  @IsString()
  @IsOptional()
  prefix?: string;
}
