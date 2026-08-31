import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '@prisma/client';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Purchase Orders are ADMIN-only */
@ApiTags('purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'purchase-orders', version: '1' })
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create purchase order' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transition purchase order status' })
  transition(@Param('id') id: string, @Body('status') status: PurchaseOrderStatus) {
    return this.service.transition(id, status);
  }

  @Post(':id/receive')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Record received items for purchase order' })
  receiveItems(@Param('id') id: string, @Body('items') items: any[]) {
    return this.service.receiveItems(id, items);
  }
}
