import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { ActiveUser } from '@/auth/guards/active-user.guard';

@Controller('puzzles')
export class PuzzleController {
  constructor(private readonly puzzleService: PuzzleService) {}

  @Get('random')
  async getRandomPuzzle(@Request() req) {
    return this.puzzleService.getRandomPuzzle(req.user.id);
  }

  @Post(':id/complete')
  async completePuzzle(
    @ActiveUser('sub') userId: number,
    @Param('id') puzzleId: string,
  ) {
    return this.puzzleService.markPuzzleAsCompleted(userId, puzzleId);
  }
}
