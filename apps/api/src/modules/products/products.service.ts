import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import slugify from 'slugify';

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' as const } },
  documents: true,
  variants: {
    where: { isActive: true },
    include: {
      attributes: { include: { attribute: true } },
      supplierProducts: {
        where: { isAvailable: true },
        include: { supplier: { select: { id: true, companyName: true } } },
      },
      inventoryItems: {
        include: { warehouse: { select: { id: true, name: true } } },
      },
    },
  },
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, search, categoryId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive;

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { variants: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return { data: product };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException(`Product not found`);
    return { data: product };
  }

  async create(dto: CreateProductDto) {
    const slug = await this.uniqueSlug(dto.name, dto.slug);
    const { variants, ...productData } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        slug,
        variants: variants
          ? {
              create: variants.map((v) => ({
                sku: v.sku,
                name: v.name,
                barcode: v.barcode,
                attributes: v.attributes
                  ? { create: v.attributes }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
    return { data: product, message: 'Product created' };
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.name && !dto.slug) {
      data.slug = await this.uniqueSlug(dto.name, undefined, id);
    }
    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });
    return { data: product, message: 'Product updated' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    return { message: 'Product deactivated' };
  }

  // ── Variant operations ────────────────────────────────────────────────────

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.findOne(productId);
    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        name: dto.name,
        barcode: dto.barcode,
        attributes: dto.attributes
          ? { create: dto.attributes }
          : undefined,
      },
      include: { attributes: { include: { attribute: true } } },
    });
    return { data: variant, message: 'Variant created' };
  }

  async updateVariant(productId: string, variantId: string, dto: Partial<CreateVariantDto>) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { sku: dto.sku, name: dto.name, barcode: dto.barcode },
    });
    return { data: updated, message: 'Variant updated' };
  }

  async setAttributeValue(variantId: string, attributeId: string, value: string) {
    const result = await this.prisma.productAttributeValue.upsert({
      where: { variantId_attributeId: { variantId, attributeId } },
      update: { value },
      create: { variantId, attributeId, value },
    });
    return { data: result };
  }

  private async uniqueSlug(name: string, slug?: string, excludeId?: string): Promise<string> {
    let base = slug || slugify(name, { lower: true, strict: true });
    let candidate = base;
    let i = 1;
    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${i++}`;
    }
  }
}
