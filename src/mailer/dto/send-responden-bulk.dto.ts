import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendRespondenBulkDto {
  @IsString({ message: 'Subjek harus berupa teks' })
  @IsNotEmpty({ message: 'Subjek tidak boleh kosong' })
  subject: string;

  // Template HTML yang akan menerima placeholder {{nama}} dan {{link}}
  @IsString({ message: 'HTML harus berupa teks' })
  @IsOptional()
  htmlTemplate?: string;

  // Template Teks biasa yang akan menerima placeholder {{nama}} dan {{link}}
  @IsString({ message: 'Text harus berupa teks' })
  @IsOptional()
  textTemplate?: string;
}