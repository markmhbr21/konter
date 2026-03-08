import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  SetBranchProductDto,
  RegisterBarcodeDto,
  ScanBarcodeDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Post('set-branch-stock')
  setBranchStock(@Body() dto: SetBranchProductDto) {
    return this.productsService.setBranchStock(dto);
  }

  @Get('branch/:branchId')
  getProductsByBranch(@Param('branchId') branchId: string) {
    return this.productsService.getProductsByBranch(+branchId);
  }

  @Post('barcode/scan')
  scanBarcode(@Body() dto: ScanBarcodeDto) {
    return this.productsService.scanBarcodeValidation(
      dto.barcode,
      dto.branchId,
    );
  }

  @Post(':id') // Changed from PATCH for Expo App compat
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Post('delete/:id') // Changed from DELETE for better compat with proxy/CORS
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
