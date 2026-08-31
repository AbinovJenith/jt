import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'STATUS_CHANGE';

export interface AuditInput {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /** Write one audit record — never throws, never blocks the caller */
  async log(input: AuditInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({ data: input as any });
    } catch {
      // Silently swallow — audit must never crash the main flow
    }
  }

  async findAll(filters: {
    resource?: string;
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const { resource, userId, action, from, to, page = 1, limit = 50 } = filters;
    const where: any = {};
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (+page - 1) * +limit,
        take: +limit,
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);

    return {
      data: logs,
      meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) },
    };
  }
}
