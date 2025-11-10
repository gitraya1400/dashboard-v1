import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STATUS_CODES } from 'node:http';
import { PrismaService } from 'src/prisma/prisma.service';
var CryptoJS = require("crypto-js");

@Injectable()
export class LinkService {
    constructor(private prisma: PrismaService, private configService: ConfigService) { }

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
            const data = await this.prisma.tautan.findMany({
                select: { token: true }
            })
            data.forEach(async e => {
                await this.prisma.tautan.updateMany({
                    data: {
                        tautanLandingPage: `${link}?data=${e.token}`
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
