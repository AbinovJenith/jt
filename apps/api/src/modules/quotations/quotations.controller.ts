import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuotationStatus } from '@prisma/client';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'quotations', version: '1' })
export class QuotationsController {
  constructor(private service: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: 'List quotations' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation detail' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create quotation from RFQ' })
  create(@Body() dto: CreateQuotationDto) { return this.service.create(dto); }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transition quotation status (send, accept, reject)' })
  transition(@Param('id') id: string, @Body('status') status: QuotationStatus) {
    return this.service.transition(id, status);
  }

  @Post(':id/convert-to-order')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Convert accepted quotation to order' })
  convertToOrder(@Param('id') id: string) {
    return this.service.convertToOrder(id);
  }
}
