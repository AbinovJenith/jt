import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async salesReport(query: { from: string; to: string; groupBy?: 'day' | 'week' | 'month' }) {
    const { from, to, groupBy = 'day' } = query;

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(from), lte: new Date(to) },
        status: { notIn: ['CANCELLED', 'RETURNED'] },
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const grouped: Record<string, { period: string; count: number; total: number }> = {};
    for (const order of orders) {
      const date = order.createdAt;
      let key: string;

      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        // ISO week: get Monday of the week
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = d.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 10);
      }

      if (!grouped[key]) grouped[key] = { period: key, count: 0, total: 0 };
      grouped[key].count += 1;
      grouped[key].total += Number(order.totalAmount);
    }

    const data = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    const grandTotal = data.reduce((s, r) => s + r.total, 0);

    return { data, meta: { from, to, groupBy, grandTotal } };
  }

  async inventoryReport() {
    const items = await this.prisma.inventoryItem.findMany({
      include: {
        variant: { include: { product: { select: { id: true, name: true } } } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ warehouse: { name: 'asc' } }, { variant: { sku: 'asc' } }],
    });

    const data = items.map((item) => ({
      id: item.id,
      warehouse: item.warehouse,
      variant: item.variant,
      qtyOnHand: item.qtyOnHand,
      qtyReserved: item.qtyReserved,
      qtyAvailable: item.qtyOnHand - item.qtyReserved,
      reorderLevel: item.reorderLevel,
    }));

    return { data };
  }

  async supplierReport() {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          select: { totalAmount: true, status: true },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    const data = suppliers.map((s) => {
      const totalValue = s.purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);
      return {
        id: s.id,
        companyName: s.companyName,
        contactName: s.contactName,
        email: s.email,
        isActive: s.isActive,
        poCount: s.purchaseOrders.length,
        totalPoValue: totalValue,
      };
    });

    return { data };
  }

  async customerReport() {
    const customers = await this.prisma.customer.findMany({
      include: {
        orders: {
          select: { totalAmount: true, status: true },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    const data = customers.map((c) => {
      const activeOrders = c.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED');
      const totalValue = activeOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        id: c.id,
        companyName: c.companyName,
        contactName: c.contactName,
        email: c.email,
        isActive: c.isActive,
        orderCount: activeOrders.length,
        totalOrderValue: totalValue,
      };
    });

    return { data };
  }
}
