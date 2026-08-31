import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller({ path: 'portal', version: '1' })
export class PortalController {
  constructor(private service: PortalService) {}

  // ── Profile ──────────────────────────────────────────────────────────────

  @Get('profile')
  @ApiOperation({ summary: '[Customer] Get my profile' })
  getProfile(@CurrentUser() user: any) {
    return this.service.getMyProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: '[Customer] Update my profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: any) {
    return this.service.updateMyProfile(user.id, dto);
  }

  // ── Catalog ───────────────────────────────────────────────────────────────
  // All authenticated roles can browse — method-level @Roles overrides class-level

  @Get('catalog')
  @Roles('CUSTOMER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '[All] Browse product catalog' })
  getCatalog(@Query() query: any) {
    return this.service.getCatalog(query);
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '[Customer] My order history' })
  getOrders(@CurrentUser() user: any, @Query() query: any) {
    return this.service.getMyOrders(user.id, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: '[Customer] My order detail' })
  getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getMyOrder(user.id, id);
  }

  @Post('orders')
  @ApiOperation({ summary: '[Customer] Place a new order' })
  placeOrder(@CurrentUser() user: any, @Body() dto: any) {
    return this.service.placeOrder(user.id, dto);
  }
}
