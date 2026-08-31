import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Change own password' })
  changePassword(@Param('id') id: string, @Body() body: any) {
    return this.service.changePassword(id, body);
  }
}
