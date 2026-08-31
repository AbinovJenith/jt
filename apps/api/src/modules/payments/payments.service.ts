import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; invoiceId?: string }) {
    const { invoiceId } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          invoice: { select: { id: true, invoiceNumber: true, status: true } },
        },
        orderBy: { paidAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            order: { select: { id: true, orderNumber: true, customer: { select: { id: true, companyName: true } } } },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return { data: payment };
  }
}
