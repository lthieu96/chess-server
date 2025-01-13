import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { ActiveUser } from 'src/auth/guards/active-user.guard';
import { MoveDto } from './dto/move.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameDto } from './dto/game.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  async create(
    @ActiveUser('sub') userId: number,
    @Body() createGameDto: CreateGameDto,
  ) {
    try {
      return await this.gameService.createGame(userId, createGameDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing game' })
  @ApiResponse({ status: 200, description: 'Joined game successfully' })
  async joinGame(@Param('id') id: number, @ActiveUser('sub') userId: number) {
    try {
      return await this.gameService.joinGame(id, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Make a move in a game' })
  @ApiResponse({ status: 200, description: 'Move made successfully' })
  async makeMove(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
    @Body() moveDto: MoveDto,
  ) {
    try {
      return await this.gameService.makeMove(id, userId, moveDto.move);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all public rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of public rooms retrieved successfully',
    type: [GameDto],
  })
  async getPublicRooms() {
    try {
      return await this.gameService.getPublicRooms();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('completed')
  async getCompletedGames(@ActiveUser('sub') userId: number) {
    return this.gameService.getCompletedGamesForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game details' })
  @ApiResponse({
    status: 200,
    description: 'Game details retrieved successfully',
  })
  async getGame(@Param('id') id: number) {
    try {
      return await this.gameService.getGame(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/players')
  async getPlayers(@Param('id') id: number) {
    return this.gameService.getPlayersInGame(id);
  }
}
