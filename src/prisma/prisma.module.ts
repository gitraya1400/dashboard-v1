import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[ConfigModule],
  exports: [PrismaService],
  providers: [PrismaService,ConfigService],
})
export class PrismaModule {}
