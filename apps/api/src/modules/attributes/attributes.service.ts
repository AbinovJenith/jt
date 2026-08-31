import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributeType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async findGroupsByCategory(categoryId: string) {
    const groups = await this.prisma.attributeGroup.findMany({
      where: { categoryId },
      include: { attributes: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    return { data: groups };
  }

  async createGroup(dto: { name: string; categoryId: string; sortOrder?: number }) {
    const group = await this.prisma.attributeGroup.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return { data: group, message: 'Attribute group created' };
  }

  async updateGroup(id: string, dto: { name?: string; sortOrder?: number }) {
    const group = await this.prisma.attributeGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException(`Attribute group ${id} not found`);
    const updated = await this.prisma.attributeGroup.update({ where: { id }, data: dto });
    return { data: updated, message: 'Attribute group updated' };
  }

  async deleteGroup(id: string) {
    const group = await this.prisma.attributeGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException(`Attribute group ${id} not found`);
    await this.prisma.attributeGroup.delete({ where: { id } });
    return { message: 'Attribute group deleted' };
  }

  async createAttribute(
    groupId: string,
    dto: {
      name: string;
      slug: string;
      type: AttributeType;
      unit?: string;
      options?: string[];
      isRequired?: boolean;
      isFilterable?: boolean;
      isSortable?: boolean;
      sortOrder?: number;
    },
  ) {
    const group = await this.prisma.attributeGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Attribute group ${groupId} not found`);

    const attribute = await this.prisma.attributeDefinition.create({
      data: {
        groupId,
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        unit: dto.unit,
        options: dto.options ?? [],
        isRequired: dto.isRequired ?? false,
        isFilterable: dto.isFilterable ?? false,
        isSortable: dto.isSortable ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return { data: attribute, message: 'Attribute created' };
  }

  async updateAttribute(
    id: string,
    dto: {
      name?: string;
      slug?: string;
      type?: AttributeType;
      unit?: string;
      options?: string[];
      isRequired?: boolean;
      isFilterable?: boolean;
      isSortable?: boolean;
      sortOrder?: number;
    },
  ) {
    const attr = await this.prisma.attributeDefinition.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException(`Attribute ${id} not found`);
    const updated = await this.prisma.attributeDefinition.update({ where: { id }, data: dto });
    return { data: updated, message: 'Attribute updated' };
  }

  async deleteAttribute(id: string) {
    const attr = await this.prisma.attributeDefinition.findUnique({ where: { id } });
    if (!attr) throw new NotFoundException(`Attribute ${id} not found`);
    await this.prisma.attributeDefinition.delete({ where: { id } });
    return { message: 'Attribute deleted' };
  }
}
