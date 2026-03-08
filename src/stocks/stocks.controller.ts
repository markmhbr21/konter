import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { AddStockDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  addVoucherStock(@Body() addStockDto: AddStockDto) {
    return this.stocksService.addVoucherStock(addStockDto);
  }

  @Get('branch/:branchId')
  findAvailableByBranch(@Param('branchId') branchId: string) {
    return this.stocksService.findAvailableByBranch(+branchId);
  }

  @Get('check/:barcode/:branchId')
  checkBarcodeStatus(
    @Param('barcode') barcode: string,
    @Param('branchId') branchId: string,
  ) {
    return this.stocksService.checkBarcodeAvailable(barcode, +branchId);
  }
}
