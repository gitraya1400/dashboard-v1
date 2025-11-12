import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/mailer/mailer.service';

@Module({
  providers: [LinkService,PrismaService, AuthService, EmailService], 
  controllers: [LinkController]
})
export class LinkModule {}