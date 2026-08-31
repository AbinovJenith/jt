import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'attributes', version: '1' })
export class AttributesController {
  constructor(private service: AttributesService) {}

  @Get('groups')
  @Public()
  @ApiOperation({ summary: 'List attribute groups for a category' })
  findGroupsByCategory(@Query('categoryId') categoryId: string) {
    return this.service.findGroupsByCategory(categoryId);
  }

  @Post('groups')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create attribute group' })
  createGroup(@Body() body: any) {
    return this.service.createGroup(body);
  }

  @Put('groups/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update attribute group' })
  updateGroup(@Param('id') id: string, @Body() body: any) {
    return this.service.updateGroup(id, body);
  }

  @Delete('groups/:id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Delete attribute group' })
  deleteGroup(@Param('id') id: string) {
    return this.service.deleteGroup(id);
  }

  @Post('groups/:groupId/attributes')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create attribute definition in group' })
  createAttribute(@Param('groupId') groupId: string, @Body() body: any) {
    return this.service.createAttribute(groupId, body);
  }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update attribute definition' })
  updateAttribute(@Param('id') id: string, @Body() body: any) {
    return this.service.updateAttribute(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Delete attribute definition' })
  deleteAttribute(@Param('id') id: string) {
    return this.service.deleteAttribute(id);
  }
}
