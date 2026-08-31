import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  // ── Profile ────────────────────────────────────────────────────────────────

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // Linked Customer record (matched by email)
    const customer = await this.prisma.customer.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        gstNumber: true,
        address: true,
        creditLimit: true,
        creditTerms: true,
        isActive: true,
      },
    });

    return { data: { ...user, customer } };
  }

  async updateMyProfile(
    userId: string,
    dto: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });
    return { data: user, message: 'Profile updated' };
  }

  // ── Catalog ────────────────────────────────────────────────────────────────

  async getCatalog(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    const { page = 1, limit = 20, search, categoryId } = query;
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (+page - 1) * +limit,
        take: +limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: { select: { name: true, slug: true } },
          variants: {
            take: 3,
            select: {
              id: true,
              sku: true,
              name: true,
              supplierProducts: { select: { basePrice: true }, take: 1 },
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
        },
      }),
    ]);

    return {
      data: products,
      meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) },
    };
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  private async resolveCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const customer = await this.prisma.customer.findUnique({
      where: { email: user.email },
    });
    return customer;
  }

  async getMyOrders(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const customer = await this.resolveCustomer(userId);
    if (!customer) return { data: [], meta: { total: 0, page: +page, limit: +limit, pages: 0 } };

    const where = { customerId: customer.id };
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (+page - 1) * +limit,
        take: +limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              qty: true,
              unitPrice: true,
              totalPrice: true,
              variant: {
                select: { sku: true, name: true, product: { select: { name: true } } },
              },
            },
          },
          invoices: {
            select: { id: true, invoiceNumber: true, status: true, totalAmount: true },
          },
        },
      }),
    ]);

    return {
      data: orders,
      meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) },
    };
  }

  async getMyOrder(userId: string, orderId: string) {
    const customer = await this.resolveCustomer(userId);
    if (!customer) throw new NotFoundException('Customer profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id },
      include: {
        items: {
          include: {
            variant: { include: { product: { select: { name: true, slug: true } } } },
          },
        },
        invoices: true,
        shipments: true,
      },
    });

    if (!order) throw new ForbiddenException('Order not found or access denied');
    return { data: order };
  }

  async placeOrder(
    userId: string,
    dto: {
      items: { variantId: string; qty: number; unitPrice: number }[];
      notes?: string;
    },
  ) {
    const customer = await this.resolveCustomer(userId);
    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found — please complete registration first',
      );
    }

    // Generate order number via sequence counter
    const counter = await this.prisma.sequenceCounter.update({
      where: { name: 'ORD' },
      data: { current: { increment: 1 } },
    });
    const orderNumber = `ORD-${String(counter.current).padStart(5, '0')}`;

    const totalAmount = dto.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: OrderStatus.CONFIRMED,
        totalAmount,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            variantId: i.variantId,
            qty: i.qty,
            unitPrice: i.unitPrice,
            totalPrice: i.qty * i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return { data: order, message: 'Order placed successfully' };
  }
}
