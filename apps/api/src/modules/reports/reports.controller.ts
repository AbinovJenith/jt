import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Sales report grouped by period' })
  salesReport(@Query() query: any) {
    return this.service.salesReport(query);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventory report with availability' })
  inventoryReport() {
    return this.service.inventoryReport();
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Supplier purchase order summary' })
  supplierReport() {
    return this.service.supplierReport();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Customer order value summary' })
  customerReport() {
    return this.service.customerReport();
  }
}
