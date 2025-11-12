import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { EmailService } from 'src/mailer/mailer.service';
import { SendRespondenBulkDto } from 'src/mailer/dto/send-responden-bulk.dto';

@Injectable()
export class LinkService {
    constructor(private prisma: PrismaService, private configService: ConfigService, private emailService: EmailService) { } // <-- MODIFIKASI CONSTRUCTOR
   
    async sendBulkEmailWithLink(dto: SendRespondenBulkDto) {
        // 1. Dapatkan data responden dan tautan unik
        const tautanList = await this.prisma.tautan.findMany({
            where: { tautanLandingPage: { not: null } },
            select: {
                responden: {
                    select: {
                        email: true,
                        nama: true,
                    },
                },
                tautanLandingPage: true,
            },
        });

        if (tautanList.length === 0) {
            throw new NotFoundException('Tidak ada responden dengan tautan landing page yang terdaftar.');
        }
        
        const emailsToSend: Array<{ to: string; subject: string; text?: string; html?: string }> = [];

        // 2. Iterasi, personalsiasi template, dan siapkan email
        for (const item of tautanList) {
            const { email, nama } = item.responden;
            const link = item.tautanLandingPage;

            let html = dto.htmlTemplate ?? '';
            let text = dto.textTemplate ?? '';
            
            // Ganti placeholder: {{nama}} dan {{link}}
            if (html) {
                html = html.replace(/\{\{nama\}\}/g, nama ?? '').replace(/\{\{link\}\}/g, link ?? '');
            }
            if (text) {
                text = text.replace(/\{\{nama\}\}/g, nama ?? '').replace(/\{\{link\}\}/g, link ?? '');
            }

                emailsToSend.push({
                to: email,
                subject: dto.subject,
                text: text,
                html: html,
            });
        }
        // 3. Kirim Email secara iteratif
        const results: Array<{ success: boolean; messageId: any; response: any }> = [];
        for (const item of emailsToSend) {
            const res = await this.emailService.sendMail(item);
            results.push(res);
        }

        return { 
            message: `Berhasil mengirim ${results.length} email dari ${tautanList.length} total responden.`, 
            results 
        };
    }
   
    async getFormLink(token: string) {
        try {
            const data = await this.prisma.tautan.findUnique({
                where: { token: token }
            })

            if (!data) {
                return {
                    message: 'link tidak ditemukan',
                    STATUS_CODES: HttpStatus.NOT_FOUND
                }
            }

            if (data.isUsed === 1) {
                return {
                    message: 'link sudah digunakan',
                    STATUS_CODES: HttpStatus.CONFLICT
                }
            }

            // Update jika isUsed === 0
            const updated = await this.prisma.tautan.update({
                data: {
                    isUsed: 1,
                    activeAt: new Date()
                },
                where: { id: data.id }
            })

            return {
                data: updated,
                STATUS_CODES: HttpStatus.OK
            };
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async createTautan(idResponden: number, tautanForm: string, token: string) {
        try {
            const responden = await this.prisma.responden.findUnique({
                where: { id: idResponden },
            });

            if (!responden) {
                throw new BadRequestException('Responden tidak ditemukan');
            }

            const tautan = await this.prisma.tautan.create({
                data: {
                    tautanForm,
                    token,
                    isUsed: 0,
                    idResponden,
                },
            });

            return {
                message: 'Tautan berhasil dibuat',
                data: tautan,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async encrypt(param: string): Promise<string> {
        try {
            var ciphertext = CryptoJS.AES.encrypt(param, this.configService.get<string>('SECRET_KEY')).toString();
            const Base64Safe = ciphertext.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            return Base64Safe;
        } catch (error) {
            throw new BadRequestException
        }
    }

    async decrypt(param: string) {
        try {
            let base64 = param.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            var bytes = CryptoJS.AES.decrypt(base64, this.configService.get<string>('SECRET_KEY'));

            var originalText = bytes.toString(CryptoJS.enc.Utf8);
            return {
                result: originalText
            }

        } catch (error) {
            throw new BadRequestException
        }
    }

    async generateToken() {
        try {
            const data = await this.prisma.responden.findMany({
                select: {
                    nama: true, email: true, id: true
                }
            })
            for (const e of data) {
                const merged = e.nama + ',' + e.email;
                const encrypted = await this.encrypt(merged);
    
                await this.prisma.tautan.upsert({
                    where: { idResponden: e.id }, // cek berdasarkan idResponden
                    update: { token: encrypted, isUsed: 0 }, // update jika sudah ada
                    create: { idResponden: e.id, token: encrypted, isUsed: 0 } // create jika belum ada
                });
            }
            return {
                message: 'token berhasil digenerate',
                STATUS_CODES: HttpStatus.OK
            }
        } catch (error) {
            throw error;
        }
    }

    async setLandingLink(link: string) {
        try {
            // =======================================================
            // PERUBAHAN LOGIKA: AUTO-GENERATE TOKEN DULU
            // Memastikan semua responden memiliki token enkripsi terbaru sebelum membuat link.
            await this.generateToken(); 
            // =======================================================

            const data = await this.prisma.tautan.findMany({
                select: { token: true }
            })

            // gunakan for..of agar update berjalan berurutan/tertangani jika perlu
            for (const e of data) {
                await this.prisma.tautan.updateMany({
                    data: {
                        tautanLandingPage: `${link}?data=${e.token}`
                    },
                    where: {
                        token: e.token
                    }
                })
            }

            return {
                message: 'Berhasil generate token dan membuat tautan landing page',
                STATUS_CODES: HttpStatus.OK
            }
        } catch (error) {
            throw error;
        }
    }

    async setFormLink(link: string) {
        try {
            const data = await this.prisma.tautan.findMany({
                select: { token: true }
            })
            data.forEach(async e => {
                await this.prisma.tautan.updateMany({
                    data: {
                        tautanForm: `${link}`
                    },
                    where: {
                        token: e.token
                    }
                })
            })
            return {
                message: 'berhasil membuat tautan form',
                STATUS_CODES: HttpStatus.OK
            }
        } catch (error) {
            throw error;
        }
    }

}
