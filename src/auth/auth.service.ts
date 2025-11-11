import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('SECRET_KEY') ?? 'supersecretkey';
  }

  async generateToken(payload: Record<string, any>): Promise<string> {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1s' });
  }

  async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
