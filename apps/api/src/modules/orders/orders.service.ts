import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED:          ['PROCESSING', 'CANCELLED'],
  PROCESSING:         ['PARTIALLY_SHIPPED', 'SHIPPED', 'CANCELLED'],
  PARTIALLY_SHIPPED:  ['SHIPPED'],
  SHIPPED:            ['DELIVERED'],
  DELIVERED:          ['RETURNED'],
  CANCELLED:          [],
  RETURNED:           [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; customerId?: string; status?: OrderStatus }) {
    const { customerId, status } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, companyName: true } },
          _count: { select: { items: true, invoices: true, shipments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: { select: { id: true, quotationNumber: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
        invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true, dueDate: true } },
        shipments: { select: { id: true, trackingNumber: true, status: true, carrier: true } },
        purchaseOrders: { select: { id: true, poNumber: true, status: true, supplier: { select: { companyName: true } } } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return { data: order };
  }

  async transition(id: string, toStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${toStatus}`,
      );
    }

    const updated = await this.prisma.order.update({ where: { id }, data: { status: toStatus } });
    return { data: updated, message: `Order status: ${toStatus}` };
  }

  async generateInvoice(orderId: string, dueDate: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoices: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const invoiceNumber = await this.prisma.nextSequence('INV');
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        amount: order.totalAmount,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        dueDate: new Date(dueDate),
      },
    });
    return { data: invoice, message: 'Invoice generated' };
  }
}
