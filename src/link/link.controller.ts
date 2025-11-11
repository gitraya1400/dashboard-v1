import { Body, Controller, Get, Post, HttpStatus, UnauthorizedException, Req } from '@nestjs/common';
import { LinkService } from './link.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('api/link')
export class LinkController {
    constructor(private linkService: LinkService, private prisma: PrismaService, private authService: AuthService) { }

    // @Post('get-form')
    // async getFormLink(@Body('token') token: string) {
    //     return this.linkService.getFormLink(token);
    // }
    // @Post('get-form')
    // async getForm(@Body('token') token: string, @Req() req: Request) {
    //     try {
    //         const tautan = await this.prisma.tautan.findUnique({ where: { token: token } });
    //         if (!tautan) {
    //             return {
    //                 message: 'Tautan tidak ditemukan',
    //                 STATUS_CODES: HttpStatus.NOT_FOUND
    //             }
    //         }

    //         if (tautan.isUsed === 0) {
    //             const jwt = await this.authService.generateToken(`${tautan.idResponden}${tautan.token}`);
    //             await this.prisma.tautan.update({
    //                 where: { id: tautan.id },
    //                 data: {
    //                     sessions: jwt,
    //                     isUsed: 1,
    //                     activeAt: new Date(),
    //                 },
    //             });


    //             return { tautanForm: tautan.tautanForm, STATUS_CODES: 200, token: jwt }
    //         }

    //         const authHeader = req.headers['authorization'];
    //         if (!authHeader) return {
    //             message: 'Header not foundd',
    //             STATUS_CODES: HttpStatus.UNAUTHORIZED
    //         }


    //         const tokenHeader = authHeader.split(' ')[1];
    //         if (!tokenHeader) {
    //             return {
    //                 message: 'Header not found',
    //                 STATUS_CODES: HttpStatus.UNAUTHORIZED
    //             }
    //         }
    //         const payload = await this.authService.validateToken(tokenHeader);
    //         if (!payload) {
    //             return {
    //                 message: 'Tautan tidak valid',
    //                 STATUS_CODES: HttpStatus.UNAUTHORIZED
    //             }
    //         }
    //         return {
    //             tautanForm: tautan.tautanForm, STATUS_CODES: 200
    //         }

    //     } catch (error) {
    //         return {
    //             message: 'Tautan tidak valid',
    //             STATUS_CODES: HttpStatus.UNAUTHORIZED
    //         }
    //     }
    // }
    @Post('get-form')
    async getForm(@Body('token') token: string, @Req() req: Request) {
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader){
                const payload = await this.authService.validateToken(authHeader.split(' ')[1]);
                
                if(!payload){
                    return {
                        message: 'Token tidak ditemukan',
                        STATUS_CODES: HttpStatus.NOT_FOUND
                    }
                }
                return {
                    tautanForm: payload.tautanForm, STATUS_CODES: 200
                }
            }
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
            await this.prisma.tautan.update({
                where: { token: String(res.token) },
                data: {
                    isUsed: 1,
                    activeAt: new Date(),
                },
            });
            const jwt = await this.authService.generateToken({token: res.token, tautanForm:res.tautanForm});
            return { tautanForm: res.tautanForm, STATUS_CODES: 200, token: jwt }
            // return{hello:authHeader}
        } catch (error) {
            return {
                error,
                STATUS_CODES: HttpStatus.UNAUTHORIZED
            }
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
