import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    // Return only root categories (parentId = null); children are nested
    return { data: categories.filter((c) => !c.parentId) };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        attributeGroups: {
          include: { attributes: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return { data: category };
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.uniqueSlug(dto.name, dto.slug);

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException(`Parent category not found`);
    }

    const category = await this.prisma.category.create({
      data: { ...dto, slug },
    });
    return { data: category, message: 'Category created' };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.name && !dto.slug) {
      data.slug = await this.uniqueSlug(dto.name, undefined, id);
    }
    const category = await this.prisma.category.update({ where: { id }, data });
    return { data: category, message: 'Category updated' };
  }

  async remove(id: string) {
    await this.findOne(id);
    // Soft delete
    await this.prisma.category.update({ where: { id }, data: { isActive: false } });
    return { message: 'Category deactivated' };
  }

  private async uniqueSlug(name: string, slug?: string, excludeId?: string): Promise<string> {
    let base = slug || slugify(name, { lower: true, strict: true });
    let candidate = base;
    let i = 1;
    while (true) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${i++}`;
    }
  }
}
