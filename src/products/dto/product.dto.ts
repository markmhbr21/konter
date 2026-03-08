import { ProductType } from '../product.entity';

export class CreateProductDto {
  name: string;
  type: ProductType;
  providerId?: number;
  nominal?: number;
  fee?: number;
  minNominal?: number;
  maxNominal?: number;
  barcode?: string;

  capitalPrice?: number;
  sellingPrice?: number;

  // Optional default branch for initial stock setting
  branchId?: number;
  stockQty?: number;
}

export class UpdateProductDto {
  name?: string;
  type?: ProductType;
  providerId?: number;
  nominal?: number;
  fee?: number;
  minNominal?: number;
  maxNominal?: number;
  barcode?: string;
  capitalPrice?: number;
  sellingPrice?: number;
}

export class SetBranchProductDto {
  branchId: number;
  productId: number;
  stockQty: number;
}

export class RegisterBarcodeDto {
  branchProductId: number;
  barcode: string;
  buyPrice: number;
}

export class ScanBarcodeDto {
  barcode: string;
  branchId: number;
}
