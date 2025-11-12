import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  role?: 'user' | 'admin';

  @IsOptional()
  fullName?: string;
}
