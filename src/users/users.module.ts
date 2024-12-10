import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PlayersController } from './players.controller';

@Module({
  controllers: [UsersController, PlayersController],
  providers: [UsersService],
})
export class UsersModule {}
