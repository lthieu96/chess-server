import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class JoinGameDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}

export class MoveGameDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @IsString()
  @IsNotEmpty()
  move: string;
}

export class ResignGameDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}
