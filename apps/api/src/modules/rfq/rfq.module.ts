import { Module } from '@nestjs/common';
import { RFQController } from './rfq.controller';
import { RFQService } from './rfq.service';

@Module({
  controllers: [RFQController],
  providers: [RFQService],
  exports: [RFQService],
})
export class RFQModule {}
