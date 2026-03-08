import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { BranchProduct } from './branch-product.entity';
import { VoucherBarcode } from './voucher-barcode.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  SetBranchProductDto,
} from './dto/product.dto';
import { Branch } from '../branches/branch.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BranchProduct)
    private readonly branchProductRepository: Repository<BranchProduct>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(VoucherBarcode)
    private readonly voucherBarcodeRepository: Repository<VoucherBarcode>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);

    if (createProductDto.providerId) {
      const provider = await this.providerRepository.findOne({
        where: { id: createProductDto.providerId },
      });
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
      product.provider = provider;
    }

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['provider'] });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }
  }

  async setBranchStock(dto: SetBranchProductDto): Promise<BranchProduct> {
    try {
      console.log('SetBranchStock DTO:', dto);

      const branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
      if (!branch) throw new NotFoundException('Branch not found');

      const product = await this.productRepository.findOne({
        where: { id: dto.productId },
      });
      if (!product) throw new NotFoundException('Product not found');

      console.log(
        `Product Found: ${product.name}, Type: ${product.type}, Master Stock: ${product.stockQty}`,
      );

      let bp = await this.branchProductRepository.findOne({
        where: { branch: { id: branch.id }, product: { id: product.id } },
      });

      const oldBranchStock = bp ? bp.stockQty : 0;
      const difference = Number(dto.stockQty) - oldBranchStock;

      console.log(
        `Old Branch Stock: ${oldBranchStock}, New: ${dto.stockQty}, Difference: ${difference}`,
      );

      // Deduct/Refill Master Stock for physical items
      if (product.type === 'voucher' || product.type === 'other') {
        if (difference > 0) {
          if (product.stockQty < difference) {
            throw new BadRequestException(
              `Stok Master tidak mencukupi. Sisa stok di pusat: ${product.stockQty}`,
            );
          }
          product.stockQty -= difference;
        } else if (difference < 0) {
          product.stockQty += Math.abs(difference);
        }
        await this.productRepository.save(product);
        console.log(`Updated Master Stock: ${product.stockQty}`);
      }

      if (bp) {
        bp.stockQty = Number(dto.stockQty);
      } else {
        bp = this.branchProductRepository.create({
          branch,
          product,
          stockQty: Number(dto.stockQty),
        });
      }
      const savedBp = await this.branchProductRepository.save(bp);
      console.log('Saved Branch Stock successfully');
      return savedBp;
    } catch (error) {
      console.error('Error in setBranchStock:', error);
      throw error;
    }
  }

  async getProductsByBranch(branchId: number): Promise<BranchProduct[]> {
    return this.branchProductRepository.find({
      where: { branch: { id: branchId } },
      relations: ['product'],
    });
  }

  // ==== Barcode Methods ====

  // Barcode khusus Unique Serial Number tidak digunakan lagi (diganti ke stock kuantitas)
  // scanBarcodeValidation sekarang hanya mengecek Product Barcode (Universal)
  async scanBarcodeValidation(barcode: string, branchId: number): Promise<any> {
    // 1. Cari dulu di Master Product berdasarkan Barcode
    const product = await this.productRepository.findOne({ where: { barcode } });
    
    if (product) {
      // Jika tipe digital, langsung kembalikan karena Unlimited (tidak butuh bp)
      if (product.type === 'pulsa' || product.type === 'transfer') {
        return { type: 'universal', data: { product, branchId, stockQty: 999999 } };
      }

      // Jika tipe fisik, harus cek apakah terdaftar di cabang & punya stok
      const bp = await this.branchProductRepository.findOne({
        where: { branch: { id: branchId }, product: { id: product.id } },
        relations: ['product', 'branch']
      });

      if (!bp) {
        throw new NotFoundException('Produk fisik belum terdaftar di cabang ini');
      }

      if (bp.stockQty <= 0) {
        throw new NotFoundException('Stok produk fisik habis di cabang');
      }

      return { type: 'universal', data: bp };
    }

    throw new NotFoundException('Barcode tidak dikenali di sistem (Master)');
  }
}
