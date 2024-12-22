import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
