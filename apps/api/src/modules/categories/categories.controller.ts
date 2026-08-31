import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all categories (tree)' })
  findAll() { return this.service.findAll(); }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category with attribute groups' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Create category' })
  create(@Body() dto: CreateCategoryDto) { return this.service.create(dto); }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate category' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
