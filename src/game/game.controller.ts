import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create() {
    return this.gameService.createGame();
  }

  @Get(':id')
  getGame(@Param('id') id: string) {
    return this.gameService.getGame(id);
  }
}
