import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    orderId?: string;
    status?: InvoiceStatus;
    customerId?: string;
  }) {
    const { orderId, status, customerId } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    if (customerId) where.order = { customerId };

    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { id: true, orderNumber: true, customer: { select: { id: true, companyName: true } } } },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: { include: { customer: { select: { id: true, companyName: true, email: true } } } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return { data: invoice };
  }

  async recordPayment(
    invoiceId: string,
    dto: {
      amount: number;
      method: PaymentMethod;
      reference?: string;
      notes?: string;
      paidAt?: string;
    },
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment on a cancelled invoice');
    }
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: new Decimal(dto.amount),
        method: dto.method,
        reference: dto.reference,
        notes: dto.notes,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });

    // Recalculate total paid
    const allPayments = [...invoice.payments, payment];
    const totalPaid = allPayments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Decimal(0),
    );

    let newStatus: InvoiceStatus;
    if (totalPaid.gte(invoice.totalAmount)) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : undefined,
      },
    });

    return { data: { payment, invoice: updatedInvoice }, message: 'Payment recorded' };
  }

  async cancel(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
    return { data: updated, message: 'Invoice cancelled' };
  }
}
