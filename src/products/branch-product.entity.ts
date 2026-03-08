import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { Product } from './product.entity';

@Entity('branch_products')
export class BranchProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => Product, (product) => product.branchProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  stockQty: number; // Berapa stok fisik yang ada (untuk produk digital/pulsa mungkin 0/dihiraukan)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
