import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma/prisma.service';

const PO_STATUS_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT:              ['SENT', 'CANCELLED'],
  SENT:               ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:          ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
  RECEIVED:           [],
  CANCELLED:          [],
};

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    supplierId?: string;
    status?: PurchaseOrderStatus;
  }) {
    const { supplierId, status } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          supplier: { select: { id: true, companyName: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        order: { select: { id: true, orderNumber: true } },
        items: {
          include: {
            variant: { include: { product: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    return { data: po };
  }

  async create(dto: {
    supplierId: string;
    orderId?: string;
    expectedDate?: string;
    notes?: string;
    items: { variantId: string; qty: number; unitPrice: number }[];
  }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException(`Supplier ${dto.supplierId} not found`);

    let totalAmount = new Decimal(0);
    const itemsData = dto.items.map((item) => {
      const unitPrice = new Decimal(item.unitPrice);
      const totalPrice = unitPrice.times(item.qty);
      totalAmount = totalAmount.plus(totalPrice);
      return {
        variantId: item.variantId,
        qty: item.qty,
        unitPrice,
        totalPrice,
        qtyReceived: 0,
      };
    });

    const poNumber = await this.prisma.nextSequence('PO');

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: dto.supplierId,
        orderId: dto.orderId,
        totalAmount,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        notes: dto.notes,
        items: { create: itemsData },
      },
      include: { items: true },
    });

    return { data: po, message: 'Purchase order created' };
  }

  async transition(id: string, status: PurchaseOrderStatus) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);

    const allowed = PO_STATUS_TRANSITIONS[po.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${po.status} to ${status}`);
    }

    const updated = await this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
    return { data: updated, message: `Purchase order status: ${status}` };
  }

  async receiveItems(id: string, items: { itemId: string; qtyReceived: number }[]) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    if (po.status === PurchaseOrderStatus.RECEIVED || po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot receive items for a ${po.status} purchase order`);
    }

    // Update each item's received quantity
    await Promise.all(
      items.map((r) =>
        this.prisma.purchaseOrderItem.update({
          where: { id: r.itemId },
          data: { qtyReceived: { increment: r.qtyReceived } },
        }),
      ),
    );

    // Re-fetch items to check completion
    const updatedItems = await this.prisma.purchaseOrderItem.findMany({ where: { poId: id } });
    const allReceived = updatedItems.every((item) => item.qtyReceived >= item.qty);

    const newStatus = allReceived
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.PARTIALLY_RECEIVED;

    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true },
    });

    return { data: updatedPo, message: allReceived ? 'All items received' : 'Items partially received' };
  }
}
