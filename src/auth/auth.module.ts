import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { LoginAuditService } from './services/login-audit.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, AdminAuthService, PrismaService, LoginAuditService],
  controllers: [AdminController, AuthController],
  exports: [AuthService, AdminAuthService, LoginAuditService],
})
export class AuthModule {}
