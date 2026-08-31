import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
// AuditService is provided globally via src/common/audit/audit.module.ts

@Module({
  controllers: [AuditController],
})
export class AuditAdminModule {}
