import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Invoices are ADMIN-only */
@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'invoices', version: '1' })
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/payments')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  recordPayment(@Param('id') id: string, @Body() body: any) {
    return this.service.recordPayment(id, body);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancel an invoice' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
