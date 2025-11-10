import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRespondenDto } from './dto/create-responden.dto';
import { UpdateRespondenDto } from './dto/update-responden.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RespondenEntity } from './entities/responden.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class RespondenService {
  constructor(private prisma: PrismaService) { }

  // ✅ CREATE responden baru
  async create(dto: CreateRespondenDto) {
    try {
      const existing = await this.prisma.responden.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new BadRequestException('Responden dengan email ini sudah ada');
      }

      const responden = await this.prisma.responden.create({
        data: {
          nama: dto.nama,
          email: dto.email,
        },
      });

      return new RespondenEntity(responden);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ READ semua responden
  async findAll() {
    const list = await this.prisma.responden.findMany({
      include: { tautan: true },
      orderBy: { id: 'asc' },
    });
    return list.map((r) => new RespondenEntity(r));
  }

  // ✅ READ satu responden berdasarkan ID
  async findOne(id: number) {
    const responden = await this.prisma.responden.findUnique({
      where: { id },
      include: { tautan: true },
    });

    if (!responden) {
      throw new NotFoundException(`Responden dengan ID ${id} tidak ditemukan`);
    }

    return new RespondenEntity(responden);
  }

  // ✅ UPDATE responden
  async update(id: number, dto: UpdateRespondenDto) {
    const existing = await this.prisma.responden.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Responden dengan ID ${id} tidak ditemukan`);
    }

    const updated = await this.prisma.responden.update({
      where: { id },
      data: {
        nama: dto.nama ?? existing.nama,
        email: dto.email ?? existing.email,
      },
    });

    return new RespondenEntity(updated);
  }

  // ✅ DELETE responden
  async remove(id: number) {
    const existing = await this.prisma.responden.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Responden dengan ID ${id} tidak ditemukan`);
    }

    await this.prisma.tautan.deleteMany({
      where: { idResponden: id },
    });

    await this.prisma.responden.delete({
      where: { id },
    });

    return { message: `Responden dengan ID ${id} berhasil dihapus` };
  }

  async insertManyResponden(file: Express.Multer.File) {
    
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      const inserted = await this.prisma.responden.createMany({
        data: data.map((row: {nama:string, email:string}) => ({
          nama: String(row.nama),
          email: String(row.email),
        })),
        skipDuplicates: true, // agar email duplikat dilewati
      });
      return inserted;

    } catch (error) {
      throw new BadRequestException(`Gagal memproses file: ${error.message}`);
    }
  }
}
