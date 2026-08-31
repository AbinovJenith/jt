import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      totalCustomers,
      totalSuppliers,
      totalProducts,
      openRFQs,
      pendingQuotations,
      activeOrders,
      pendingInvoices,
      lowStockCount,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.rFQ.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
      this.prisma.quotation.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      this.prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED'] } } }),
      this.prisma.invoice.count({ where: { status: { in: ['PENDING', 'OVERDUE'] } } }),
      this.prisma.inventoryItem.count({
        where: {
          reorderLevel: { not: null },
          qtyOnHand: { lte: this.prisma.inventoryItem.fields.reorderLevel as any },
        },
      }).catch(() => 0), // simplified
    ]);

    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: startOfMonth } },
    });

    // Recent orders
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customer: { select: { companyName: true } },
      },
    });

    // Recent RFQs
    const recentRFQs = await this.prisma.rFQ.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rfqNumber: true,
        status: true,
        createdAt: true,
        customer: { select: { companyName: true } },
      },
    });

    return {
      data: {
        stats: {
          totalCustomers,
          totalSuppliers,
          totalProducts,
          openRFQs,
          pendingQuotations,
          activeOrders,
          pendingInvoices,
          revenueThisMonth: revenueResult._sum.amount ?? 0,
        },
        recentOrders,
        recentRFQs,
      },
    };
  }

  async getRevenueChart(months = 6) {
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const result = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: start, lte: end } },
      });

      data.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: result._sum.amount ?? 0,
      });
    }
    return { data };
  }
}
