import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BranchProduct } from './branch-product.entity';

export enum ProductType {
  PULSA = 'pulsa',
  TRANSFER = 'transfer',
  VOUCHER = 'voucher',
  OTHER = 'other',
}

import { Provider } from '../providers/entities/provider.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: ProductType.VOUCHER })
  type: ProductType;

  @Column({ type: 'int', nullable: true })
  providerId: number;

  @ManyToOne(() => Provider, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nominal: number; // Untuk Pulsa (contoh: 10000, 20000)

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fee: number; // Untuk biaya tambahan admin Bank, markup agen Pulsa

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minNominal: number; // Khusus Produk Transfer

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxNominal: number; // Khusus Produk Transfer

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  capitalPrice: number; // Harga modal global

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sellingPrice: number; // Harga jual global

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'int', default: 0 })
  stockQty: number; // Stok master (gudang pusat)

  @OneToMany(() => BranchProduct, (branchProduct) => branchProduct.product)
  branchProducts: BranchProduct[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
