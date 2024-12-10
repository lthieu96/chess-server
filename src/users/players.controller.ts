import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '@/auth/guards/public.guard';

@Public()
@Controller('players')
export class PlayersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getPlayer(@Param('id') id: string) {
    return this.usersService.getPlayerById(+id);
  }
}
