import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Supplier management is ADMIN-only */
@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'suppliers', version: '1' })
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  create(@Body() dto: any) { return this.service.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/products')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Link product variant to supplier with pricing' })
  linkProduct(@Param('id') id: string, @Body() dto: any) {
    return this.service.linkProduct(id, dto);
  }

  @Delete(':id/products/:variantId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Unlink product from supplier' })
  unlinkProduct(@Param('id') id: string, @Param('variantId') variantId: string) {
    return this.service.unlinkProduct(id, variantId);
  }
}
