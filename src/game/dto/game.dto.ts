import { ApiProperty } from '@nestjs/swagger';

export class GameCreatorDto {
  @ApiProperty({ description: 'Creator ID' })
  id: number;

  @ApiProperty({ description: 'Creator username' })
  username: string;

  @ApiProperty({ description: 'Creator rating' })
  rating: number;
}

export class GameDto {
  @ApiProperty({ description: 'Room ID' })
  id: number;

  @ApiProperty({ description: 'Room status' })
  status: string;

  @ApiProperty({ description: 'Current game position in FEN notation' })
  fen: string;

  @ApiProperty({ description: 'White player ID' })
  whitePlayerId: number;

  @ApiProperty({ description: 'Black player ID', nullable: true })
  blackPlayerId: number | null;

  @ApiProperty({ description: 'Time control in seconds' })
  timeControl: number;

  @ApiProperty({ description: 'Time increment in seconds' })
  increment: number;

  @ApiProperty({ description: 'Whether the room is private' })
  isPrivate: boolean;

  @ApiProperty({ description: 'Room creator information' })
  creator: GameCreatorDto;
}
