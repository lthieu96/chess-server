import { IsString, IsNotEmpty } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;
}

export class MoveGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  move: string;
}
