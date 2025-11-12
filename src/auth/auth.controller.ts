import { Body, Controller, Post, HttpStatus, Req, Res, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private prisma: PrismaService) { }

    /**
     * POST /auth/register
     * Registrasi akun baru
     * Body: { username, email, password, role?, fullName? }
     * Response: { success, message, data: { id, username, email, role, createdAt } }
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
        try {
            // Cek apakah email sudah terdaftar
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            
            if (existing) {
                return {
                    success: false,
                    message: 'Email sudah terdaftar',
                    statusCode: HttpStatus.CONFLICT,
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(dto.password, 10);

            // Buat user baru
            const user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    email: dto.email,
                    password: hashedPassword,
                    role: dto.role ?? 'user',
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });

            return {
                success: true,
                message: 'Registrasi berhasil',
                data: user,
                statusCode: HttpStatus.CREATED,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registrasi gagal',
                error: error.code || error.message,
                statusCode: HttpStatus.BAD_REQUEST,
            };
        }
    }
}