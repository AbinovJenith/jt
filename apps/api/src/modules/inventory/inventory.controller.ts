import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get stock levels' })
  getStock(@Query() query: any) { return this.service.getStock(query); }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get items below reorder level' })
  getLowStock() { return this.service.getLowStock(); }

  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  getWarehouses() { return this.service.getWarehouses(); }

  @Post('warehouses')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create warehouse' })
  createWarehouse(@Body() dto: any) { return this.service.createWarehouse(dto); }

  @Patch('adjust')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Adjust stock (ADD, SUBTRACT, SET)' })
  adjust(@Body() dto: { variantId: string; warehouseId: string; qty: number; operation: 'ADD' | 'SUBTRACT' | 'SET' }) {
    return this.service.adjust(dto.variantId, dto.warehouseId, dto.qty, dto.operation);
  }
}
