import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RFQStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRFQDto } from './dto/create-rfq.dto';

const RFQ_STATUS_TRANSITIONS: Record<RFQStatus, RFQStatus[]> = {
  DRAFT:        ['SUBMITTED', 'CANCELLED'],
  SUBMITTED:    ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['QUOTED', 'CANCELLED'],
  QUOTED:       ['EXPIRED', 'CANCELLED'],
  EXPIRED:      [],
  CANCELLED:    [],
};

@Injectable()
export class RFQService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; customerId?: string; status?: RFQStatus }) {
    const { customerId, status } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.rFQ.count({ where }),
      this.prisma.rFQ.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, companyName: true, email: true } },
          _count: { select: { items: true, quotations: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const rfq = await this.prisma.rFQ.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: { select: { id: true, name: true } },
                attributes: { include: { attribute: true } },
              },
            },
          },
        },
        quotations: { select: { id: true, quotationNumber: true, status: true, totalAmount: true, createdAt: true } },
      },
    });
    if (!rfq) throw new NotFoundException(`RFQ ${id} not found`);
    return { data: rfq };
  }

  async create(dto: CreateRFQDto) {
    const rfqNumber = await this.prisma.nextSequence('RFQ');
    const rfq = await this.prisma.rFQ.create({
      data: {
        rfqNumber,
        customerId: dto.customerId,
        notes: dto.notes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        items: {
          create: dto.items.map((item) => ({
            variantId: item.variantId,
            qty: item.qty,
            notes: item.notes,
          })),
        },
      },
      include: {
        customer: { select: { id: true, companyName: true } },
        items: { include: { variant: { include: { product: { select: { name: true } } } } } },
      },
    });
    return { data: rfq, message: 'RFQ created' };
  }

  async transition(id: string, toStatus: RFQStatus) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) throw new NotFoundException(`RFQ ${id} not found`);

    const allowed = RFQ_STATUS_TRANSITIONS[rfq.status];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition RFQ from ${rfq.status} to ${toStatus}. Allowed: ${allowed.join(', ')}`,
      );
    }

    const updated = await this.prisma.rFQ.update({
      where: { id },
      data: { status: toStatus },
    });
    return { data: updated, message: `RFQ status changed to ${toStatus}` };
  }

  async addItem(rfqId: string, variantId: string, qty: number, notes?: string) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) throw new NotFoundException(`RFQ not found`);
    if (rfq.status !== 'DRAFT') throw new BadRequestException('Can only add items to DRAFT RFQ');

    const item = await this.prisma.rFQItem.create({
      data: { rfqId, variantId, qty, notes },
      include: { variant: { include: { product: { select: { name: true } } } } },
    });
    return { data: item, message: 'Item added' };
  }

  async removeItem(rfqId: string, itemId: string) {
    const item = await this.prisma.rFQItem.findFirst({ where: { id: itemId, rfqId } });
    if (!item) throw new NotFoundException('RFQ item not found');
    await this.prisma.rFQItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }
}
