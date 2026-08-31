import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with pagination & filters' })
  findAll(@Query() query: ProductQueryDto) { return this.service.findAll(query); }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) { return this.service.findBySlug(slug); }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create product with variants' })
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate product' })
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // ── Variants ─────────────────────────────────────────────────────────────

  @Post(':id/variants')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Add variant to product' })
  createVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.service.createVariant(id, dto);
  }

  @Put(':id/variants/:variantId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update variant' })
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: Partial<CreateVariantDto>,
  ) {
    return this.service.updateVariant(id, variantId, dto);
  }

  @Put('variants/:variantId/attributes/:attributeId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Set attribute value on variant' })
  setAttributeValue(
    @Param('variantId') variantId: string,
    @Param('attributeId') attributeId: string,
    @Body('value') value: string,
  ) {
    return this.service.setAttributeValue(variantId, attributeId, value);
  }
}
