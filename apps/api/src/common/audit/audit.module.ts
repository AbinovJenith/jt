import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/** @Global makes AuditService injectable in every module without explicit imports */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
