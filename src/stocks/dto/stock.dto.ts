import { StockStatus } from '../stock.entity';

export class AddStockDto {
  barcode: string;
  productId: number;
  branchId: number;
}
