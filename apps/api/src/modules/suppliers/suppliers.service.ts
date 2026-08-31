import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { search } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.supplier.count({ where }),
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { products: true, purchaseOrders: true } } },
        orderBy: { companyName: 'asc' },
      }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            variant: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
        _count: { select: { purchaseOrders: true } },
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return { data: supplier };
  }

  async create(dto: any) {
    const exists = await this.prisma.supplier.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Supplier email already exists');
    const supplier = await this.prisma.supplier.create({ data: dto });
    return { data: supplier, message: 'Supplier created' };
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const supplier = await this.prisma.supplier.update({ where: { id }, data: dto });
    return { data: supplier, message: 'Supplier updated' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.update({ where: { id }, data: { isActive: false } });
    return { message: 'Supplier deactivated' };
  }

  async linkProduct(supplierId: string, dto: { variantId: string; basePrice: number; minOrderQty?: number; leadTimeDays?: number }) {
    const result = await this.prisma.supplierProduct.upsert({
      where: { supplierId_variantId: { supplierId, variantId: dto.variantId } },
      update: { basePrice: dto.basePrice, minOrderQty: dto.minOrderQty, leadTimeDays: dto.leadTimeDays },
      create: { supplierId, variantId: dto.variantId, basePrice: dto.basePrice, minOrderQty: dto.minOrderQty ?? 1, leadTimeDays: dto.leadTimeDays },
    });
    return { data: result, message: 'Product linked to supplier' };
  }

  async unlinkProduct(supplierId: string, variantId: string) {
    await this.prisma.supplierProduct.delete({
      where: { supplierId_variantId: { supplierId, variantId } },
    });
    return { message: 'Product unlinked from supplier' };
  }
}
