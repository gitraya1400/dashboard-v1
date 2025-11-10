import { Module } from '@nestjs/common';
import { RespondenService } from './responden.service';
import { RespondenController } from './responden.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RespondenController],
  providers: [RespondenService, PrismaService],
})
export class RespondenModule {}
