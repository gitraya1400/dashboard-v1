import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { RespondenService } from './responden.service';
import { CreateRespondenDto } from './dto/create-responden.dto';
import { UpdateRespondenDto } from './dto/update-responden.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('responden')
export class RespondenController {
  constructor(private readonly respondenService: RespondenService) { }

  @Post()
  async create(@Body() createRespondenDto: CreateRespondenDto) {
    return this.respondenService.create(createRespondenDto);
  }

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    try {
      const inserted = await this.respondenService.insertManyResponden(file);
      return { message: 'Upload berhasil', count: inserted };
    } catch (error) {
      throw new BadRequestException(`Gagal memproses file: ${error.message}`);
    }
  }

  @Get()
  async findAll() {
    return this.respondenService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const responden = await this.respondenService.findOne(+id);
    if (!responden) {
      throw new NotFoundException(`Responden dengan id ${id} tidak ditemukan`);
    }
    return responden;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRespondenDto: UpdateRespondenDto) {
    try {
      return this.respondenService.update(+id, updateRespondenDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return this.respondenService.remove(+id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
