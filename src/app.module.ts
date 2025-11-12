import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinkModule } from './link/link.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RespondenModule } from './responden/responden.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { EmailModule } from './mailer/mailer.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    LinkModule,
    PrismaModule,
    AuthModule,
    EmailModule,
    DashboardModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RespondenModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService, ConfigService],
})
export class AppModule {}
