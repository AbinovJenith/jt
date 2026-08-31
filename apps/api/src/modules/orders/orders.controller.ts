import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transition order status' })
  transition(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.service.transition(id, status);
  }

  @Post(':id/invoice')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Generate invoice for order' })
  generateInvoice(@Param('id') id: string, @Body('dueDate') dueDate: string) {
    return this.service.generateInvoice(id, dueDate);
  }
}
