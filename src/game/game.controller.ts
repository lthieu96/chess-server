import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { ActiveUser } from 'src/auth/guards/active-user.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MoveDto } from './dto/move.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game created successfully' })
  async create(@ActiveUser('sub') userId: string) {
    try {
      return await this.gameService.createGame(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing game' })
  @ApiResponse({ status: 200, description: 'Joined game successfully' })
  async joinGame(@Param('id') id: string, @ActiveUser('sub') userId: string) {
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
    @Param('id') id: string,
    @ActiveUser('sub') userId: string,
    @Body() moveDto: MoveDto,
  ) {
    try {
      return await this.gameService.makeMove(id, userId, moveDto.move);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game details' })
  @ApiResponse({
    status: 200,
    description: 'Game details retrieved successfully',
  })
  async getGame(@Param('id') id: string) {
    try {
      return await this.gameService.getGame(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
