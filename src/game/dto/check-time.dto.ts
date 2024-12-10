import { IsNumber, IsNotEmpty } from 'class-validator';

export class CheckTimeDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}
