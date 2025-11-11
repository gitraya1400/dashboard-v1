import { Module } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { EmailController } from './mailer.controller';

@Module({
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
