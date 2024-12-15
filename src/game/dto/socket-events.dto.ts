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

export class DrawOfferDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}

export class DrawResponseDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @IsNotEmpty()
  accept: boolean;
}

export class CreateGameDto {
  timeControl?: number;
  increment?: number;
  isPrivate?: boolean;
}

export class ChatMessageDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
