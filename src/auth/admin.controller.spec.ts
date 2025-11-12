/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminAuthService } from './admin.service';
import { LoginAuditService } from './services/login-audit.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AdminController (e2e)', () => {
  let controller: AdminController;
  let adminAuthService: AdminAuthService;
  let auditService: LoginAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminAuthService,
          useValue: {
            validateAdminCredentials: jest.fn(),
            generateAccessToken: jest.fn(),
            verifyToken: jest.fn(),
            findAdminByUsername: jest.fn(),
          },
        },
        {
          provide: LoginAuditService,
          useValue: {
            logLoginAttempt: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminAuthService = module.get<AdminAuthService>(AdminAuthService);
    auditService = module.get<LoginAuditService>(LoginAuditService);
  });

  describe('POST /auth/admin/login', () => {
    it('seharusnya return token ketika login berhasil', async () => {
      const loginDto = { username: 'admin', password: 'password123' };
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        password: 'hashed_password',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(adminAuthService, 'validateAdminCredentials').mockResolvedValue(mockUser);
      jest.spyOn(adminAuthService, 'generateAccessToken').mockReturnValue({
        accessToken: 'mock_token',
        expiresIn: 3600,
      });

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockRequest = {
        headers: { 'user-agent': 'test-agent' },
        get: jest.fn().mockReturnValue('test-agent'),
        socket: { remoteAddress: '127.0.0.1' },
      } as any;

      await controller.login(loginDto, mockResponse, mockRequest);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login berhasil',
          data: expect.objectContaining({
            accessToken: 'mock_token',
            expiresIn: 3600,
          }),
        }),
      );
    });

    it('seharusnya return error ketika credentials invalid', async () => {
      const loginDto = { username: 'admin', password: 'wrongpassword' };

      jest
        .spyOn(adminAuthService, 'validateAdminCredentials')
        .mockRejectedValue(new UnauthorizedException('Password tidak sesuai'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      const mockRequest = {
        headers: { 'user-agent': 'test-agent' },
        get: jest.fn().mockReturnValue('test-agent'),
        socket: { remoteAddress: '127.0.0.1' },
      } as any;

      await controller.login(loginDto, mockResponse, mockRequest);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });
  });

  describe('GET /auth/admin/verify', () => {
    it('seharusnya verify token dan return user data', () => {
      const mockRequest = {
        user: {
          userId: 1,
          username: 'admin',
          role: 'admin',
          iat: 1234567890,
          exp: 1234571490,
        },
      } as any;

      const result = controller.verifyToken(mockRequest);

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Token valid',
          data: expect.objectContaining({
            userId: 1,
            username: 'admin',
            role: 'admin',
          }),
        }),
      );
    });
  });

  describe('POST /auth/admin/logout', () => {
    it('seharusnya return logout success message', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      controller.logout(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Logout berhasil',
        }),
      );
    });
  });
});
