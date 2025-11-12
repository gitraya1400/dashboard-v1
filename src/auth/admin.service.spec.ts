/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthService } from './admin.service';
import { LoginAuditService } from './services/login-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let prismaService: PrismaService;
  let auditService: LoginAuditService;

  const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNonAdminUser = {
    id: 2,
    username: 'user',
    email: 'user@test.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        LoginAuditService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<LoginAuditService>(LoginAuditService);
  });

  describe('validateAdminCredentials', () => {
    it('seharusnya return user ketika credentials valid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateAdminCredentials('admin', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('seharusnya throw UnauthorizedException ketika username tidak ditemukan', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.validateAdminCredentials('nonexistent', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('seharusnya throw UnauthorizedException ketika password salah', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.validateAdminCredentials('admin', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('seharusnya throw ForbiddenException ketika user bukan admin', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockNonAdminUser);

      await expect(service.validateAdminCredentials('user', 'password123')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('seharusnya lock akun setelah 5 percobaan gagal', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Lakukan 5 percobaan gagal
      for (let i = 0; i < 5; i++) {
        try {
          await service.validateAdminCredentials('admin', 'wrongpassword');
        } catch (e) {
          // Ignore error
        }
      }

      // Percobaan ke-6 seharusnya throw lock message
      await expect(service.validateAdminCredentials('admin', 'password123')).rejects.toThrow(
        'Akun terkunci',
      );
    });
  });

  describe('generateAccessToken', () => {
    it('seharusnya generate token yang valid', () => {
      process.env.JWT_SECRET_ADMIN = 'test-secret';
      process.env.JWT_ADMIN_EXPIRES_IN = '3600';

      const result = service.generateAccessToken({
        id: 1,
        username: 'admin',
        role: 'admin',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.expiresIn).toBe(3600);
    });

    it('seharusnya throw BadRequestException jika SECRET tidak dikonfigurasi', () => {
      const originalSecret = process.env.JWT_SECRET_ADMIN;
      delete process.env.JWT_SECRET_ADMIN;
      delete process.env.SECRET_KEY;

      expect(() =>
        service.generateAccessToken({
          id: 1,
          username: 'admin',
          role: 'admin',
        }),
      ).toThrow(BadRequestException);

      process.env.JWT_SECRET_ADMIN = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('seharusnya verify token yang valid', () => {
      process.env.JWT_SECRET_ADMIN = 'test-secret';

      const tokenData = {
        userId: 1,
        username: 'admin',
        role: 'admin',
      };

      const tokenResult = service.generateAccessToken({
        id: tokenData.userId,
        username: tokenData.username,
        role: tokenData.role,
      });

      const verified = service.verifyToken(tokenResult.accessToken);
      expect(verified).toBeDefined();
      expect(verified.userId).toBe(tokenData.userId);
      expect(verified.username).toBe(tokenData.username);
      expect(verified.role).toBe(tokenData.role);
    });

    it('seharusnya return null untuk token yang invalid', () => {
      process.env.JWT_SECRET_ADMIN = 'test-secret';
      const result = service.verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });
  });

  describe('findAdminByUsername', () => {
    it('seharusnya find admin user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findAdminByUsername('admin');
      expect(result).toEqual(mockUser);
    });

    it('seharusnya return null ketika user tidak ditemukan', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findAdminByUsername('nonexistent');
      expect(result).toBeNull();
    });

    it('seharusnya throw ForbiddenException untuk non-admin user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockNonAdminUser);

      await expect(service.findAdminByUsername('user')).rejects.toThrow(ForbiddenException);
    });
  });
});
