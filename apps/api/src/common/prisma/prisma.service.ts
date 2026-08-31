import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /** Generate next human-readable number: RFQ-0001, QUO-0001, etc. */
  async nextSequence(name: string): Promise<string> {
    const result = await this.$executeRaw`
      INSERT INTO sequence_counters (name, current)
      VALUES (${name}, 1)
      ON CONFLICT (name)
      DO UPDATE SET current = sequence_counters.current + 1
      RETURNING current
    `;
    // Fetch the updated value
    const counter = await this.sequenceCounter.findUnique({ where: { name } });
    const num = String(counter!.current).padStart(5, '0');
    return `${name}-${num}`;
  }
}
