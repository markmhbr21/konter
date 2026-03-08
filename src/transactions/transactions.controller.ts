import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.createTransaction(createTransactionDto);
  }

  @Post('bulk')
  createBulkTransactions(
    @Body() createTransactionDtos: CreateTransactionDto[],
  ) {
    return this.transactionsService.createBulkTransactions(
      createTransactionDtos,
    );
  }

  @Get('recent')
  findAllOverall(@Query('limit') limit?: string) {
    return this.transactionsService.findAllByBranch(
      undefined,
      limit ? +limit : undefined,
    );
  }

  @Get('stats/overall')
  getOverallStats() {
    return this.transactionsService.getTodayStats();
  }

  @Get('branch/:branchId')
  findAllByBranch(
    @Param('branchId') branchId: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAllByBranch(
      +branchId,
      limit ? +limit : undefined,
    );
  }

  @Get('stats/:branchId')
  getTodayStats(@Param('branchId') branchId: string) {
    return this.transactionsService.getTodayStats(+branchId);
  }
}
