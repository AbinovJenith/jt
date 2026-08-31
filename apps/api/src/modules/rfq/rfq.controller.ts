import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RFQStatus } from '@prisma/client';
import { RFQService } from './rfq.service';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('rfq')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'rfq', version: '1' })
export class RFQController {
  constructor(private service: RFQService) {}

  @Get()
  @ApiOperation({ summary: 'List RFQs' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFQ detail' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create RFQ' })
  create(@Body() dto: CreateRFQDto) { return this.service.create(dto); }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Transition RFQ status' })
  transition(@Param('id') id: string, @Body('status') status: RFQStatus) {
    return this.service.transition(id, status);
  }

  @Post(':id/items')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Add item to RFQ' })
  addItem(
    @Param('id') id: string,
    @Body() body: { variantId: string; qty: number; notes?: string },
  ) {
    return this.service.addItem(id, body.variantId, body.qty, body.notes);
  }

  @Delete(':id/items/:itemId')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Remove item from RFQ' })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }
}
