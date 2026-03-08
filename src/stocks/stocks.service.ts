import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock, StockStatus } from './stock.entity';
import { Product, ProductType } from '../products/product.entity';
import { Branch } from '../branches/branch.entity';
import { AddStockDto } from './dto/stock.dto';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async addVoucherStock(dto: AddStockDto): Promise<Stock> {
    const branch = await this.branchRepository.findOne({
      where: { id: dto.branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.type !== ProductType.VOUCHER) {
      throw new BadRequestException('Produk bukan tipe voucher fisik');
    }

    const existingStock = await this.stockRepository.findOne({
      where: { barcode: dto.barcode },
    });
    if (existingStock) throw new BadRequestException('Barcode sudah terdaftar');

    const stock = this.stockRepository.create({
      barcode: dto.barcode,
      product,
      branch,
      status: StockStatus.AVAILABLE,
    });

    return this.stockRepository.save(stock);
  }

  async findAvailableByBranch(branchId: number): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { branch: { id: branchId }, status: StockStatus.AVAILABLE },
      relations: ['product'],
    });
  }

  async checkBarcodeAvailable(
    barcode: string,
    branchId: number,
  ): Promise<Stock> {
    const stock = await this.stockRepository.findOne({
      where: {
        barcode,
        status: StockStatus.AVAILABLE,
        branch: { id: branchId },
      },
      relations: ['product'],
    });
    if (!stock)
      throw new NotFoundException(
        'Barcode tidak ditemukan atau tidak tersedia di cabang ini',
      );
    return stock;
  }
}
