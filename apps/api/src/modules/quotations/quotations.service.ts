import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuotationStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { Decimal } from '@prisma/client/runtime/library';

const STATUS_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT:    ['SENT', 'REVISED'],
  SENT:     ['ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'],
  ACCEPTED: [],
  REJECTED: ['REVISED'],
  EXPIRED:  ['REVISED'],
  REVISED:  ['SENT'],
};

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; rfqId?: string; status?: QuotationStatus }) {
    const { rfqId, status } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (rfqId) where.rfqId = rfqId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.quotation.count({ where }),
      this.prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          rfq: {
            include: { customer: { select: { id: true, companyName: true } } },
          },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: { include: { customer: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true } },
                attributes: { include: { attribute: true } },
              },
            },
            rfqItem: { select: { id: true, qty: true } },
          },
        },
      },
    });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    return { data: quotation };
  }

  async create(dto: CreateQuotationDto) {
    const rfq = await this.prisma.rFQ.findUnique({
      where: { id: dto.rfqId },
      include: { items: true },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');
    if (rfq.status === 'CANCELLED' || rfq.status === 'EXPIRED') {
      throw new BadRequestException('Cannot quote on a cancelled/expired RFQ');
    }

    const quotationNumber = await this.prisma.nextSequence('QUO');

    // Calculate totals
    let totalAmount = new Decimal(0);
    let taxAmount = new Decimal(0);

    const items = dto.items.map((item) => {
      const unitPrice = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discount ?? 0);
      const gstRate = new Decimal(item.gstRate ?? 18);
      const discountedPrice = unitPrice.mul(new Decimal(1).sub(discount.div(100)));
      const lineTotal = discountedPrice.mul(item.qty);
      const lineTax = lineTotal.mul(gstRate.div(100));
      totalAmount = totalAmount.add(lineTotal).add(lineTax);
      taxAmount = taxAmount.add(lineTax);
      return {
        rfqItemId: item.rfqItemId,
        variantId: item.variantId,
        qty: item.qty,
        unitPrice,
        discount,
        gstRate,
        totalPrice: lineTotal.add(lineTax),
        notes: item.notes,
      };
    });

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        rfqId: dto.rfqId,
        validUntil: new Date(dto.validUntil),
        notes: dto.notes,
        termsConditions: dto.termsConditions,
        totalAmount,
        taxAmount,
        items: { create: items },
      },
      include: { items: true },
    });

    // Update RFQ status to QUOTED
    await this.prisma.rFQ.update({ where: { id: dto.rfqId }, data: { status: 'QUOTED' } });

    return { data: quotation, message: 'Quotation created' };
  }

  async transition(id: string, toStatus: QuotationStatus) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id } });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);

    const allowed = STATUS_TRANSITIONS[quotation.status];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${quotation.status} to ${toStatus}`,
      );
    }

    const updated = await this.prisma.quotation.update({
      where: { id },
      data: { status: toStatus },
    });
    return { data: updated, message: `Quotation ${toStatus}` };
  }

  async convertToOrder(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: { include: { customer: true } },
        items: true,
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (quotation.status !== 'ACCEPTED') {
      throw new BadRequestException('Quotation must be ACCEPTED before converting to order');
    }

    const orderNumber = await this.prisma.nextSequence('ORD');
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: quotation.rfq.customerId,
        quotationId: id,
        totalAmount: quotation.totalAmount,
        taxAmount: quotation.taxAmount,
        items: {
          create: quotation.items.map((qi) => ({
            variantId: qi.variantId,
            qty: qi.qty,
            unitPrice: qi.unitPrice,
            discount: qi.discount,
            gstRate: qi.gstRate,
            totalPrice: qi.totalPrice,
          })),
        },
      },
      include: { items: true, customer: { select: { id: true, companyName: true } } },
    });

    return { data: order, message: 'Order created from quotation' };
  }
}
