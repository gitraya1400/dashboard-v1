import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from '../../node_modules/bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { $Enums as Role} from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;
    constructor(private prisma: PrismaService, private configService: ConfigService) {
        this.jwtSecret = this.configService.get<string>('SECRET_KEY') ?? 'supersecretkey';
    }

    async generateToken(token:string): Promise<string> {
        return jwt.sign({ token }, this.jwtSecret, { expiresIn: '1D' });
    }

    async validateToken(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
