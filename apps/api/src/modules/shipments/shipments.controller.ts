import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('shipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'shipments', version: '1' })
export class ShipmentsController {
  constructor(private service: ShipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List shipments' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create shipment' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update shipment status' })
  updateStatus(@Param('id') id: string, @Body('status') status: ShipmentStatus) {
    return this.service.updateStatus(id, status);
  }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update shipment tracking info' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
