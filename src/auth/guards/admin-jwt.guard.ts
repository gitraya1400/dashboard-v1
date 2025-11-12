import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from '../admin.service';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      const payload = this.adminAuthService.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Token tidak valid atau kadaluarsa');
      }

      if (payload.role !== 'admin') {
        throw new ForbiddenException('Hanya admin yang dapat mengakses resource ini');
      }

      // Simpan payload ke request untuk digunakan di controller
      request['user'] = payload;
      request['token'] = token;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token tidak valid');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Format Authorization header tidak valid (gunakan: Bearer <token>)');
    }

    return parts[1];
  }
}
