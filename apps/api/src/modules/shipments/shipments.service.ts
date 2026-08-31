import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PREPARING:        ['DISPATCHED'],
  DISPATCHED:       ['IN_TRANSIT'],
  IN_TRANSIT:       ['OUT_FOR_DELIVERY', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED:        [],
  RETURNED:         [],
};

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; orderId?: string; status?: ShipmentStatus }) {
    const { orderId, status } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.shipment.count({ where }),
      this.prisma.shipment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { id: true, orderNumber: true, customer: { select: { id: true, companyName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: { select: { id: true, companyName: true, email: true, phone: true } },
            items: { include: { variant: { select: { id: true, sku: true, name: true } } } },
          },
        },
      },
    });
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return { data: shipment };
  }

  async create(dto: { orderId: string; trackingNumber?: string; carrier?: string; notes?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        notes: dto.notes,
      },
    });
    return { data: shipment, message: 'Shipment created' };
  }

  async updateStatus(id: string, status: ShipmentStatus) {
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);

    const allowed = SHIPMENT_STATUS_TRANSITIONS[shipment.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${shipment.status} to ${status}`);
    }

    const extraData: any = {};
    if (status === ShipmentStatus.DISPATCHED) extraData.shippedAt = new Date();
    if (status === ShipmentStatus.DELIVERED) extraData.deliveredAt = new Date();

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { status, ...extraData },
    });
    return { data: updated, message: `Shipment status: ${status}` };
  }

  async update(id: string, dto: { trackingNumber?: string; carrier?: string; notes?: string }) {
    const shipment = await this.prisma.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    const updated = await this.prisma.shipment.update({ where: { id }, data: dto });
    return { data: updated, message: 'Shipment updated' };
  }
}
