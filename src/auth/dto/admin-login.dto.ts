import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username harus diisi' })
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password harus diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
