import { IsString, IsNotEmpty } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: number;
}

export class MoveGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: number;

  @IsString()
  @IsNotEmpty()
  move: string;
}
