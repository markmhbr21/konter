import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('branch/:branchId')
  getBranchReport(
    @Param('branchId') branchId: string,
    @Query('startDate') startDateString?: string,
    @Query('endDate') endDateString?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const start = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setHours(0, 0, 0, 0));
    let end = new Date();
    if (endDateString) {
      end = new Date(endDateString);
      end.setHours(23, 59, 59, 999); // Include full day
    }
    return this.reportsService.getProfitReportByBranch(
      +branchId, 
      start, 
      end, 
      page ? +page : 1, 
      limit ? +limit : 10
    );
  }

  @Get('overall')
  getOverallReport(
    @Query('startDate') startDateString?: string,
    @Query('endDate') endDateString?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const start = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(1)); // default awal bulan
    let end = new Date();
    if (endDateString) {
      end = new Date(endDateString);
      end.setHours(23, 59, 59, 999); // Include full day
    }
    return this.reportsService.getOverallProfitReport(
      start, 
      end, 
      page ? +page : 1, 
      limit ? +limit : 10
    );
  }
}
