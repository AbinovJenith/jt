import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard summary — KPIs, recent orders, RFQs' })
  getSummary() { return this.service.getSummary(); }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Revenue chart data (last N months)' })
  getRevenueChart(@Query('months') months = 6) {
    return this.service.getRevenueChart(Number(months));
  }
}
