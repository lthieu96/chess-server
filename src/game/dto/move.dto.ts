import { IsString, IsNotEmpty } from 'class-validator';

export class MoveDto {
  @IsString()
  @IsNotEmpty()
  move: string;
}
