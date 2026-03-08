import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { BranchProduct } from '../products/branch-product.entity';
import { Product } from '../products/product.entity';
import { Branch } from '../branches/branch.entity';
import { VoucherBarcode } from '../products/voucher-barcode.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      BranchProduct,
      VoucherBarcode,
      Product,
      Branch,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
