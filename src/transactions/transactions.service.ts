import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Transaction, PaymentMethod } from './transaction.entity';
import { Branch } from '../branches/branch.entity';
import { Product, ProductType } from '../products/product.entity';
import { User } from '../users/user.entity';
import { BranchProduct } from '../products/branch-product.entity';
import { CreateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(BranchProduct)
    private branchProductRepository: Repository<BranchProduct>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    // 1. Cek tipe produk terlebih dahulu untuk menentukan apakah butuh cek stok cabang
    const product = await this.productRepository.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    console.log(`Debug createTransaction: branchId=${dto.branchId}, productId=${dto.productId}, type=${product.type}`);

    let branch: Branch | null = null;
    let bp: BranchProduct | null = null;

    const isDigital = product.type === ProductType.PULSA || product.type === ProductType.TRANSFER || product.type === ProductType.EWALLET;

    if (isDigital) {
      // Produk digital: Unlimited stok, tidak wajib terdaftar di branch_products
      branch = await this.branchRepository.findOne({ where: { id: dto.branchId } });
      if (!branch) {
        throw new NotFoundException('Cabang tidak ditemukan');
      }
      console.log(`Digital product detected (${product.type}). Bypassing branch stock check.`);
    } else {
      // Produk fisik: Ambil relasi dari branch_products untuk cek stok
      bp = await this.branchProductRepository.findOne({
        where: { branch: { id: dto.branchId }, product: { id: dto.productId } },
        relations: ['product', 'branch'],
      });

      if (!bp) {
        throw new NotFoundException('Produk tidak tersedia di cabang ini (Belum didaftarkan)');
      }
      branch = bp.branch;
    }

    if (!branch) {
       throw new NotFoundException('Data cabang tidak valid');
    }

    const qty = dto.qty || 1;
    let barcodeRaw = dto.barcodeScanned;

    // 2. Kurangi stok hanya jika produk fisik
    if (!isDigital && bp) {
      if (bp.stockQty < qty) {
        throw new BadRequestException(
          `Stok produk fisik tidak mencukupi. Tersedia: ${bp.stockQty}`,
        );
      }

      bp.stockQty -= qty;
      await this.branchProductRepository.save(bp);
    }

    // 3. Kalkulasi Profit dari Master Product (atau override dari DTO untuk Transfer dinamis)
    let finalCapitalPrice = Number(product.capitalPrice) || 0;
    let finalSellingPrice = Number(product.sellingPrice) || 0;

    if (product.type === ProductType.PULSA || product.type === ProductType.TRANSFER || product.type === ProductType.EWALLET) {
      finalCapitalPrice = Number(product.nominal) || 0;
    }

    console.log(`Debug Price Calc: dto.overrideSellingPrice=${dto.overrideSellingPrice}, product.nominal=${product.nominal}, type=${product.type}`);

    if (dto.overrideSellingPrice !== undefined && dto.overrideSellingPrice !== null && Number(dto.overrideSellingPrice) > 0) {
      finalSellingPrice = Number(dto.overrideSellingPrice);
    } else if (product.type === ProductType.PULSA || product.type === ProductType.TRANSFER || product.type === ProductType.EWALLET) {
      finalSellingPrice = (Number(product.nominal) || 0) + (Number(product.fee) || 0);
    }

    // Safety fallback for digital products to avoid 0 revenue
    if (isDigital && finalSellingPrice <= 0) {
      finalSellingPrice = (Number(product.nominal) || 0) + (Number(product.fee) || 0);
    }

    console.log(`Final Prices: selling=${finalSellingPrice}, capital=${finalCapitalPrice}`);

    const finalProfit = dto.overrideProfit !== undefined 
      ? Number(dto.overrideProfit) * qty 
      : (finalSellingPrice - finalCapitalPrice) * qty;

    // 4. Catat Transaksi
    const transaction = this.transactionRepository.create({
      branch: branch,
      product: product,
      user: dto.userId ? ({ id: dto.userId } as User) : undefined,
      qty,
      capitalPriceAtSale: finalCapitalPrice,
      sellingPriceAtSale: finalSellingPrice,
      profit: finalProfit,
      barcodeScanned: barcodeRaw,
      paymentMethod: dto.paymentMethod || PaymentMethod.CASH,
    });

    return this.transactionRepository.save(transaction);
  }

  async createBulkTransactions(
    dtos: CreateTransactionDto[],
  ): Promise<Transaction[]> {
    // We use a simple loop. In a production system, a DB transaction is preferred.
    const results: Transaction[] = [];
    for (const dto of dtos) {
      const result = await this.createTransaction(dto);
      results.push(result);
    }
    return results;
  }

  async getTodayStats(branchId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: MoreThanOrEqual(today),
    };

    if (branchId) {
      where.branch = { id: branchId };
    }

    const transactions = await this.transactionRepository.find({
      where,
    });

    const totalCount = transactions.length;
    let totalRevenue = 0;
    let totalProfit = 0;

    transactions.forEach((t) => {
      totalRevenue += Number(t.sellingPriceAtSale);
      totalProfit += Number(t.profit);
    });

    return {
      totalCount,
      totalRevenue,
      totalProfit,
    };
  }

  async findAllByBranch(
    branchId?: number,
    limit?: number,
  ): Promise<Transaction[]> {
    const where = branchId ? { branch: { id: branchId } } : {};
    return this.transactionRepository.find({
      where,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
