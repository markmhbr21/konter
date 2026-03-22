import { PaymentMethod } from '../transaction.entity';

export class CreateTransactionDto {
  branchId: number;
  productId: number;
  userId?: number;
  qty?: number;
  paymentMethod?: PaymentMethod;
  barcodeScanned?: string;
  overrideSellingPrice?: number;
  overrideProfit?: number;
  notes?: string;
}
