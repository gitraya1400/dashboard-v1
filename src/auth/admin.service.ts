import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAuditService } from './services/login-audit.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthService {
  private failedLoginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 15;

  private getSecret(): string {
    const secret = process.env.JWT_SECRET_ADMIN || process.env.SECRET_KEY;
    if (!secret) {
      throw new BadRequestException('JWT_SECRET_ADMIN or SECRET_KEY not configured in .env');
    }
    return secret;
  }

  constructor(
    private prisma: PrismaService,
    private auditService: LoginAuditService,
  ) {}

  async findAdminByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    if (user.role !== 'admin') throw new ForbiddenException('User ini bukan admin');
    return user;
  }

  /**
   * Check apakah akun sedang di-lock karena terlalu banyak percobaan gagal
   */
  private isAccountLocked(username: string): boolean {
    const attempt = this.failedLoginAttempts.get(username);
    if (!attempt) return false;

    const now = Date.now();
    const timeSinceLastAttempt = (now - attempt.lastAttempt) / 1000 / 60; // dalam menit

    if (timeSinceLastAttempt > this.LOCK_TIME_MINUTES) {
      // Lock time sudah terlewati, reset
      this.failedLoginAttempts.delete(username);
      return false;
    }

    return attempt.count >= this.MAX_FAILED_ATTEMPTS;
  }

  /**
   * Record failed login attempt
   */
  private recordFailedAttempt(username: string): void {
    const attempt = this.failedLoginAttempts.get(username) || { count: 0, lastAttempt: Date.now() };
    attempt.count++;
    attempt.lastAttempt = Date.now();
    this.failedLoginAttempts.set(username, attempt);
  }

  /**
   * Clear failed attempts setelah login berhasil
   */
  private clearFailedAttempts(username: string): void {
    this.failedLoginAttempts.delete(username);
  }

  async validateAdminCredentials(username: string, password: string) {
    // Check jika akun terkunci
    if (this.isAccountLocked(username)) {
      throw new UnauthorizedException(
        `Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam ${this.LOCK_TIME_MINUTES} menit.`,
      );
    }

    const user = await this.findAdminByUsername(username);
    if (!user) {
      this.recordFailedAttempt(username);
      throw new UnauthorizedException('Username tidak ditemukan');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.recordFailedAttempt(username);
      throw new UnauthorizedException('Password tidak sesuai');
    }

    // Login berhasil, clear failed attempts
    this.clearFailedAttempts(username);
    return user;
  }

  generateAccessToken(payload: { id: number; username: string; role?: string }) {
    const secret = this.getSecret();
    const expiresIn = parseInt(process.env.JWT_ADMIN_EXPIRES_IN || '3600', 10);

    const token = jwt.sign(
      {
        userId: payload.id,
        username: payload.username,
        role: payload.role || 'admin',
      },
      secret,
      { expiresIn },
    );
    return { accessToken: token, expiresIn };
  }

  verifyToken(token: string) {
    const secret = this.getSecret();
    try {
      const payload = jwt.verify(token, secret) as any;
      return payload;
    } catch (e) {
      return null;
    }
  }
}