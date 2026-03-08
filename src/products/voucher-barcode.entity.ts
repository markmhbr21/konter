import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BranchProduct } from './branch-product.entity';
import { User } from '../users/user.entity';

@Entity('voucher_barcodes')
export class VoucherBarcode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  barcode: string;

  // We link this barcode to the specific branch inventory (which dictates the selling price)
  @ManyToOne(() => BranchProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchProductId' })
  branchProduct: BranchProduct;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  buyPrice: number; // Disimpan per pcs waktu di-scan saat kulakan

  @Column({ type: 'boolean', default: false })
  isSold: boolean;

  // Null if bought by Admin, else links to the employee who scanned it into system
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'registeredById' })
  registeredBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
