import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../branches/branch.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  QRIS = 'qris',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Jika produk fisik berupa voucher ber-barcode
  @Column({ type: 'varchar', length: 150, nullable: true })
  barcodeScanned: string;

  @Column({ type: 'int', default: 1 })
  qty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  capitalPriceAtSale: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sellingPriceAtSale: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  profit: number; // sellingPrice - capitalPrice

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @CreateDateColumn()
  createdAt: Date;
}
