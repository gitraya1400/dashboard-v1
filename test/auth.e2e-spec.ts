import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin Authentication E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;

  const mockAdmin = {
    username: 'test_admin',
    email: 'test_admin@example.com',
    password: 'testpassword123',
    role: 'admin',
  };

  const mockNonAdmin = {
    username: 'test_user',
    email: 'test_user@example.com',
    password: 'userpassword123',
    role: 'user',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Create test users
    const adminHash = await bcrypt.hash(mockAdmin.password, 10);
    const userHash = await bcrypt.hash(mockNonAdmin.password, 10);

    // Clean up existing test users
    await prismaService.user.deleteMany({
      where: {
        username: { in: [mockAdmin.username, mockNonAdmin.username] },
      },
    });

    // Create test users
    await prismaService.user.create({
      data: {
        username: mockAdmin.username,
        email: mockAdmin.email,
        password: adminHash,
        role: mockAdmin.role,
      },
    });

    await prismaService.user.create({
      data: {
        username: mockNonAdmin.username,
        email: mockNonAdmin.email,
        password: userHash,
        role: mockNonAdmin.role,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prismaService.user.deleteMany({
      where: {
        username: { in: [mockAdmin.username, mockNonAdmin.username] },
      },
    });

    await app.close();
  });

  describe('POST /auth/admin/login', () => {
    it('✅ should login successfully with correct admin credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Login berhasil',
          data: expect.objectContaining({
            accessToken: expect.any(String),
            expiresIn: expect.any(Number),
            user: expect.objectContaining({
              username: mockAdmin.username,
              role: 'admin',
            }),
          }),
        }),
      );

      // Save token for next tests
      accessToken = response.body.data.accessToken;
    });

    it('❌ should fail when password is wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('tidak sesuai'),
        }),
      );
    });

    it('❌ should fail when username not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('tidak ditemukan'),
        }),
      );
    });

    it('❌ should fail when user is not admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockNonAdmin.username,
          password: mockNonAdmin.password,
        })
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('bukan admin'),
        }),
      );
    });

    it('❌ should fail when username is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: '',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('❌ should fail when password is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('❌ should lock account after 5 failed attempts', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/admin/login')
          .send({
            username: mockAdmin.username,
            password: 'wrongpassword',
          })
          .expect(401);
      }

      // 6th attempt should return lock message
      const response = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('terkunci'),
        }),
      );
    });
  });

  describe('GET /auth/admin/verify', () => {
    it('✅ should verify valid token', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app.getHttpServer())
        .get('/auth/admin/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Token valid',
          data: expect.objectContaining({
            username: mockAdmin.username,
            role: 'admin',
          }),
        }),
      );
    });

    it('❌ should fail when no token provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/verify')
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining('tidak ditemukan'),
        }),
      );
    });

    it('❌ should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining('tidak valid'),
        }),
      );
    });

    it('❌ should fail with malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/verify')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining('tidak valid'),
        }),
      );
    });
  });

  describe('GET /auth/admin/profile', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      validToken = loginResponse.body.data.accessToken;
    });

    it('✅ should get admin profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Profil admin berhasil diambil',
          data: expect.objectContaining({
            username: mockAdmin.username,
            email: mockAdmin.email,
            role: 'admin',
          }),
        }),
      );
    });

    it('❌ should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/profile')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('POST /auth/admin/logout', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      validToken = loginResponse.body.data.accessToken;
    });

    it('✅ should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Logout berhasil'),
        }),
      );
    });

    it('❌ should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/admin/logout')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('GET /dashboard', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      validToken = loginResponse.body.data.accessToken;
    });

    it('✅ should access dashboard with valid admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Dashboard data berhasil diambil',
          data: expect.objectContaining({
            stats: expect.any(Object),
          }),
        }),
      );
    });

    it('❌ should deny access without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });

    it('❌ should deny access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', 'Bearer invalid.token')
        .expect(401);

      expect(response.body).toHaveProperty('statusCode', 401);
    });
  });

  describe('GET /dashboard/statistics', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      validToken = loginResponse.body.data.accessToken;
    });

    it('✅ should get statistics with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/statistics')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Statistik dashboard',
          data: expect.objectContaining({
            users: expect.any(Object),
            responden: expect.any(Object),
            surveys: expect.any(Object),
          }),
        }),
      );
    });
  });
});
