import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditService } from '../../common/audit/audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs — Admin only' })
  @ApiQuery({ name: 'resource', required: false, description: 'e.g. Product, Order, Customer' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE'],
  })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date (2025-01-01)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date (2025-12-31)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getLogs(@Query() query: any) {
    return this.audit.findAll(query);
  }
}
