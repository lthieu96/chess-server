import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { JwtModule } from '@nestjs/jwt';
import { GameController } from './game.controller';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [JwtModule.registerAsync(jwtConfig.asProvider())],
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
