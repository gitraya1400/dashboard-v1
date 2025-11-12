import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AdminAuthService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { LoginAuditService } from './services/login-audit.service';

@Controller('auth/admin')
export class AdminController {
  constructor(
    private adminAuthService: AdminAuthService,
    private auditService: LoginAuditService,
  ) {}

  /**
   * POST /auth/admin/login
   * Login dengan username dan password
   * Response: { accessToken, expiresIn, user: { id, username, role } }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      // Validasi credentials
      const user = await this.adminAuthService.validateAdminCredentials(
        loginDto.username,
        loginDto.password,
      );

      // Generate token
      const { accessToken, expiresIn } = this.adminAuthService.generateAccessToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      // Log successful login
      const ipAddress = this.getClientIp(request);
      const userAgent = request.get('user-agent') || 'Unknown';
      await this.auditService.logLoginAttempt({
        userId: user.id,
        username: user.username,
        success: true,
        ipAddress,
        userAgent,
      });

      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Login berhasil',
        data: {
          accessToken,
          expiresIn,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      // Log failed login
      const ipAddress = this.getClientIp(request);
      const userAgent = request.get('user-agent') || 'Unknown';
      await this.auditService.logLoginAttempt({
        userId: 0,
        username: loginDto.username,
        success: false,
        ipAddress,
        userAgent,
        reason: error.message,
      });

      return response.status(error.getStatus?.() || HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message || 'Login gagal',
        error: error.getResponse?.() || error.message,
      });
    }
  }

  /**
   * GET /auth/admin/verify
   * Verifikasi token yang sudah ada
   * Header: Authorization: Bearer <token>
   */
  @Get('verify')
  @UseGuards(AdminJwtGuard)
  verifyToken(@Req() request: Request) {
      const user = (request as any)['user'];
    return {
      success: true,
      message: 'Token valid',
      data: {
          userId: user?.userId,
          username: user?.username,
          role: user?.role,
          iat: user?.iat,
          exp: user?.exp,
      },
    };
  }

  /**
   * GET /auth/admin/profile
   * Dapatkan profil admin yang sedang login
   * Header: Authorization: Bearer <token>
   */
  @Get('profile')
  @UseGuards(AdminJwtGuard)
  async getProfile(@Req() request: Request) {
      const user = (request as any)['user'];
      const userFromDb = await this.adminAuthService.findAdminByUsername(user?.username);

    return {
      success: true,
      message: 'Profil admin berhasil diambil',
      data: {
          id: userFromDb?.id,
          username: userFromDb?.username,
          email: userFromDb?.email,
          role: userFromDb?.role,
          createdAt: userFromDb?.createdAt,
          updatedAt: userFromDb?.updatedAt,
      },
    };
  }

  /**
   * POST /auth/admin/logout
   * Logout (hapus token dari client side)
   */
  @Post('logout')
  @UseGuards(AdminJwtGuard)
  logout(@Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      success: true,
      message: 'Logout berhasil. Hapus token dari localStorage/cookie Anda.',
    });
  }

  /**
   * Helper untuk mendapatkan IP address client
   */
  private getClientIp(request: Request): string {
    return (
        (Array.isArray(request.headers['x-forwarded-for'])
          ? request.headers['x-forwarded-for'][0]
          : (request.headers['x-forwarded-for'] as string)?.split(',')[0]) ||
        (Array.isArray(request.headers['x-real-ip'])
          ? request.headers['x-real-ip'][0]
          : (request.headers['x-real-ip'] as string)) ||
      request.socket.remoteAddress ||
      'Unknown'
    );
  }
}
