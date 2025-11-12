import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface LoginLog {
  userId: number;
  username: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  reason?: string;
}

@Injectable()
export class LoginAuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Catat aktivitas login ke dalam sistem
   * Catatan: Anda dapat membuat tabel AdminLoginLog di database jika perlu tracking permanen
   */
  async logLoginAttempt(log: LoginLog): Promise<void> {
    // Implementasi ini dapat disimpan ke database atau file log
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${log.success ? 'SUCCESS' : 'FAILED'} - User: ${log.username} (ID: ${log.userId}) - IP: ${log.ipAddress} - Reason: ${log.reason || 'N/A'}`;
    
    console.log(logMessage);
    
    // Jika ingin menyimpan ke database, aktifkan code di bawah ini
    // dan tambahkan model AdminLoginLog ke schema.prisma
    /*
    await this.prisma.adminLoginLog.create({
      data: {
        userId: log.userId,
        username: log.username,
        success: log.success,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        reason: log.reason,
        createdAt: new Date(),
      },
    });
    */
  }

  /**
   * Check failed login attempts untuk rate limiting
   */
  async getFailedLoginAttempts(username: string, minuteWindow: number = 15): Promise<number> {
    // Implementasi sederhana - bisa diganti dengan Redis atau database
    return 0;
  }
}
