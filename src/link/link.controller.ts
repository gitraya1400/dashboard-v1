import { Body, Controller, Get, Post, HttpStatus, UnauthorizedException, Req } from '@nestjs/common';
import { LinkService } from './link.service';
import { SendRespondenBulkDto } from 'src/mailer/dto/send-responden-bulk.dto'; // <-- ADDED
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('api/link')
export class LinkController {
    constructor(private linkService: LinkService, private prisma: PrismaService, private authService: AuthService) { }

    // --- Perbaikan pada POST /api/link/get-form (Agar kolom sessions terisi) ---
    @Post('get-form')
    async getForm(@Body('token') token: string, @Req() req: Request) {
        try {
            const authHeader = req.headers['authorization'];
            // jika ada Authorization header, validasi dan kembalikan payload
            if (authHeader){
                const payload = await this.authService.validateToken(authHeader.split(' ')[1]);
                
                if(!payload){
                    return {
                        message: 'Token tidak ditemukan',
                        STATUS_CODES: HttpStatus.NOT_FOUND
                    }
                }
                return {
                    tautanForm: payload.tautanForm, STATUS_CODES: HttpStatus.OK
                }
            }

            // tanpa header: gunakan token body untuk mencari tautan yang belum digunakan
            if(!token){
                return {
                    message: 'Token tidak ditemukan',
                    STATUS_CODES: HttpStatus.NOT_FOUND
                }
            }
            const res = await this.prisma.tautan.findUnique({
                select:{
                    tautanForm:true, token:true},
                where: { token: token, isUsed:0},
            });

            if(!res){
                return {
                    message: 'Tautan tidak ditemukan atau sudah digunakan',
                    STATUS_CODES: HttpStatus.NOT_FOUND
                }
            }
            
            // Generate JWT sesi dan simpan ke kolom sessions serta tandai isUsed
            const jwt = await this.authService.generateToken({token: res.token, tautanForm:res.tautanForm});
            await this.prisma.tautan.update({
                where: { token: String(res.token) },
                data: {
                    isUsed: 1,
                    activeAt: new Date(),
                    sessions: jwt, // <-- Menyimpan JWT ke kolom sessions
                },
            });

            return { tautanForm: res.tautanForm, STATUS_CODES: HttpStatus.OK, token: jwt }
        } catch (error) {
            return {
                error,
                STATUS_CODES: HttpStatus.UNAUTHORIZED
            }
        }
    }
    
    // --- ENDPOINT BARU UNTUK PENGIRIMAN MASSAL (SEKALI JALAN) ---
    @Post('send-invitation-bulk')
    async sendToAllResponden(@Body() dto: SendRespondenBulkDto) {
        try {
            if (!dto.textTemplate && !dto.htmlTemplate) {
                return {
                    message: 'Mohon sediakan template textTemplate atau htmlTemplate',
                    STATUS_CODES: HttpStatus.BAD_REQUEST,
                };
            }
            return this.linkService.sendBulkEmailWithLink(dto);
        } catch (error) {
            return {
                message: error.message || 'Gagal mengirim email massal',
                STATUS_CODES: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    
    @Post('tautan')
    async createTautan(
        @Body('idResponden') idResponden: number,
        @Body('tautanForm') tautanForm: string,
        @Body('token') token: string,
    ) {
        return this.linkService.createTautan(idResponden, tautanForm, token);
    }

    @Post('generate-token')
    async getEnkripsi() {
        return this.linkService.generateToken();
    }

    @Post('decrypt')
    async encrypt(@Body('data') data: string) {
        const res = await this.linkService.decrypt(data);
        return res;
    }
    @Post('encrypt')
    async decrypt(@Body('data') data: string) {
        const res = await this.linkService.encrypt(data);
        return res;
    }

    @Post('set-landingPage-link')
    async setLandingLink(@Body('link') base: string) {
        return this.linkService.setLandingLink(base);
    }

    @Post('set-formPage-link')
    async setFormLink(@Body('link') base: string) {
        return this.linkService.setFormLink(base);
    }


}
