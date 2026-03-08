import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { BranchProduct } from './branch-product.entity';
import { Branch } from '../branches/branch.entity';
import { VoucherBarcode } from './voucher-barcode.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      BranchProduct,
      Branch,
      VoucherBarcode,
      Provider,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
