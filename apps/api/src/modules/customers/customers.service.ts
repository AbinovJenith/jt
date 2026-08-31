import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { search } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { rfqs: true, orders: true } } },
        orderBy: { companyName: 'asc' },
      }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { rfqs: true, orders: true } },
        rfqs: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, rfqNumber: true, status: true, createdAt: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true } },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return { data: customer };
  }

  async create(dto: any) {
    const exists = await this.prisma.customer.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');
    const customer = await this.prisma.customer.create({ data: dto });
    return { data: customer, message: 'Customer created' };
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const customer = await this.prisma.customer.update({ where: { id }, data: dto });
    return { data: customer, message: 'Customer updated' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.update({ where: { id }, data: { isActive: false } });
    return { message: 'Customer deactivated' };
  }
}
