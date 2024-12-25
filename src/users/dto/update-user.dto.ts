import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  @IsOptional()
  role?: 'user' | 'admin';
}
