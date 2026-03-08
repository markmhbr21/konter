import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getProfitReportByBranch(
    branchId: number,
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        branch: { id: branchId },
        createdAt: Between(startDate, endDate),
      },
      relations: ['product', 'branch'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // For calculations (Omzet/Profit), we still need the FULL list or sum from DB
    // Simple way for now: fetch all for calculations, then paginate list
    // Better way: Run two queries or use query builder for sums
    const allTransactions = await this.transactionRepository.find({
      where: {
        branch: { id: branchId },
        createdAt: Between(startDate, endDate),
      },
      relations: ['product', 'branch'],
    });

    const totalRevenue = allTransactions.reduce(
      (sum, t) => {
        let price = Number(t.sellingPriceAtSale) || 0;
        // Fallback for digital products with 0 price in DB (legacy or parsing error)
        if (price <= 0 && t.product && (t.product.type === 'pulsa' || t.product.type === 'transfer')) {
          price = (Number(t.product.nominal) || 0) + (Number(t.product.fee) || 0);
        }
        return sum + price * (t.qty || 1);
      },
      0,
    );
    const totalProfit = allTransactions.reduce(
      (sum, t) => {
        let prof = Number(t.profit) || 0;
        if (prof <= 0 && t.product && (t.product.type === 'pulsa' || t.product.type === 'transfer')) {
          prof = Number(t.product.fee) || 0;
        }
        return sum + prof;
      },
      0,
    );
    const totalTransactions = allTransactions.length;

    return { 
      totalRevenue, 
      totalProfit, 
      totalTransactions, 
      transactions,
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getOverallProfitReport(
    startDate: Date, 
    endDate: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    // Separate query for calculations (Total Omzet/Profit)
    const allTransactions = await this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['branch', 'product'],
    });

    const totalRevenue = allTransactions.reduce(
      (sum, t) => {
        let price = Number(t.sellingPriceAtSale) || 0;
        if (price <= 0 && t.product && (t.product.type === 'pulsa' || t.product.type === 'transfer')) {
          price = (Number(t.product.nominal) || 0) + (Number(t.product.fee) || 0);
        }
        return sum + price * (t.qty || 1);
      },
      0,
    );
    const totalProfit = allTransactions.reduce(
      (sum, t) => {
        let prof = Number(t.profit) || 0;
        if (prof <= 0 && t.product && (t.product.type === 'pulsa' || t.product.type === 'transfer')) {
          prof = Number(t.product.fee) || 0;
        }
        return sum + prof;
      },
      0,
    );

    // Kelompokkan by branch
    const breakdownByBranch = allTransactions.reduce(
      (acc, t) => {
        const bId = t.branch.id;
        if (!acc[bId]) {
          acc[bId] = {
            branchId: bId,
            branchName: t.branch.name,
            revenue: 0,
            profit: 0,
            count: 0,
          };
        }
        
        let price = Number(t.sellingPriceAtSale) || 0;
        let prof = Number(t.profit) || 0;
        if (price <= 0 && t.product && (t.product.type === 'pulsa' || t.product.type === 'transfer')) {
          price = (Number(t.product.nominal) || 0) + (Number(t.product.fee) || 0);
          prof = Number(t.product.fee) || 0;
        }
        
        acc[bId].revenue += price * (t.qty || 1);
        acc[bId].profit += prof;
        acc[bId].count += 1;
        return acc;
      },
      {} as Record<number, any>,
    );

    // Paginated transactions for the list
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['branch', 'product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      totalRevenue,
      totalProfit,
      totalTransactions: allTransactions.length,
      breakdown: Object.values(breakdownByBranch),
      transactions,
      page,
      limit,
      totalCount: total,
      totalPages: Math.ceil(total / limit)
    };
  }
}
