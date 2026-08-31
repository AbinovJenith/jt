import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Customer data is ADMIN-only — Staff and Customers cannot access this resource */
@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'customers', version: '1' })
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] List all customers' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get customer detail' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: '[Admin] Create customer' })
  create(@Body() dto: any) { return this.service.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: '[Admin] Update customer' })
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Deactivate customer account' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
