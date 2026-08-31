import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStock(query: { warehouseId?: string; variantId?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 50, warehouseId, variantId } = query;
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (variantId) where.variantId = variantId;

    const [total, items] = await Promise.all([
      this.prisma.inventoryItem.count({ where }),
      this.prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variant: { include: { product: { select: { id: true, name: true } } } },
          warehouse: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { data: items.map(i => ({
      ...i,
      qtyAvailable: i.qtyOnHand - i.qtyReserved,
      isLow: i.reorderLevel ? i.qtyOnHand <= i.reorderLevel : false,
    })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async adjust(variantId: string, warehouseId: string, qty: number, operation: 'ADD' | 'SUBTRACT' | 'SET') {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });

    let newQty: number;
    if (operation === 'SET') {
      newQty = qty;
    } else if (operation === 'ADD') {
      newQty = (item?.qtyOnHand ?? 0) + qty;
    } else {
      newQty = (item?.qtyOnHand ?? 0) - qty;
      if (newQty < 0) throw new BadRequestException('Insufficient stock');
    }

    const updated = await this.prisma.inventoryItem.upsert({
      where: { variantId_warehouseId: { variantId, warehouseId } },
      update: { qtyOnHand: newQty },
      create: { variantId, warehouseId, qtyOnHand: newQty },
    });
    return { data: updated, message: 'Stock adjusted' };
  }

  async getWarehouses() {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { isActive: true },
      include: { _count: { select: { inventory: true } } },
    });
    return { data: warehouses };
  }

  async createWarehouse(dto: { name: string; code: string; address?: any }) {
    const warehouse = await this.prisma.warehouse.create({ data: dto });
    return { data: warehouse, message: 'Warehouse created' };
  }

  async getLowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { reorderLevel: { not: null } },
      include: {
        variant: { include: { product: { select: { name: true } } } },
        warehouse: { select: { name: true } },
      },
    });
    const lowStock = items.filter(i => i.reorderLevel && i.qtyOnHand <= i.reorderLevel);
    return { data: lowStock };
  }
}
