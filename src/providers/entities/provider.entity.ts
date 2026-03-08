import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/product.entity'; // Update path import jika perlu

export enum ProviderType {
  PULSA = 'pulsa',
  TRANSFER = 'transfer',
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'enum', enum: ProviderType })
  type: ProviderType;

  // Prefix misal untuk Telkomsel: '0812,0813'. Untuk Bank misal BCA: '014'
  @Column({ type: 'varchar', length: 255, nullable: true })
  prefix: string;

  @OneToMany(() => Product, (product) => product.provider)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
