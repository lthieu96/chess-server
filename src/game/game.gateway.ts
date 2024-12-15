import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Logger, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JoinGameDto,
  MoveGameDto,
  ResignGameDto,
  DrawOfferDto,
  DrawResponseDto,
  ChatMessageDto,
} from './dto/socket-events.dto';
import { CheckTimeDto } from './dto/check-time.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
  namespace: 'games',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<string, Set<string>> = new Map();
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;

      // Track user's socket connections
      const userSockets = this.userSockets.get(payload.sub) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(payload.sub, userSockets);
    } catch (error) {
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      const userSockets = this.userSockets.get(client.data.userId);
      if (userSockets) {
        userSockets.delete(client.id);

        // Only handle game disconnection if this was the user's last socket connection
        if (userSockets.size === 0) {
          this.userSockets.delete(client.data.userId);

          // Handle game disconnection
          const result = await this.gameService.handleDisconnect(
            client.data.userId,
          );

          if (result) {
            const { game, type } = result;

            // Notify players about game over due to disconnect
            this.server.to(game.id.toString()).emit('gameOver', {
              winner: game.winner,
              reason: 'Player disconnected',
              finalState: game,
            });
          }
        }
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() joinGameDto: JoinGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.joinGame(
        joinGameDto.gameId,
        client.data.userId,
      );
      client.join(joinGameDto.gameId.toString());
      this.server.to(joinGameDto.gameId.toString()).emit('gameState', game);
      return { event: 'joinGame', data: game };
    } catch (error) {
      this.logger.error('Error joining game:', error.message);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('move')
  async handleMove(
    @MessageBody() moveGameDto: MoveGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.makeMove(
        moveGameDto.gameId,
        client.data.userId,
        moveGameDto.move,
      );

      // Emit game state to all players in the room
      this.server.to(moveGameDto.gameId.toString()).emit('gameState', game);

      // If game is over, emit detailed game over event
      if (game.status === 'completed') {
        const gameOverEvent = {
          winner: game.winner,
          reason: this.getGameOverReason(game),
          finalState: game,
        };
        this.server
          .to(moveGameDto.gameId.toString())
          .emit('gameOver', gameOverEvent);
      }

      return {
        event: 'move',
        data: {
          ...game,
          currentTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error handling move:', error.message);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('resign')
  async handleResign(
    @MessageBody() resignGameDto: ResignGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.resignGame(
        resignGameDto.gameId,
        client.data.userId,
      );
      this.server.to(resignGameDto.gameId.toString()).emit('gameOver', {
        winner: game.winner,
        reason: 'Player resigned',
      });
      return { event: 'resign', data: game };
    } catch (error) {
      this.logger.error('Error handling resignation:', error.message);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('checkTime')
  async handleCheckTime(
    @MessageBody() checkTimeDto: CheckTimeDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameState = await this.gameService.checkTime(checkTimeDto.gameId);

      // If time has expired, notify all players
      if (gameState.timeExpired) {
        const gameOverEvent = {
          winner: gameState.winner,
          reason: 'timeout',
          finalState: gameState,
        };
        this.server
          .to(checkTimeDto.gameId.toString())
          .emit('gameOver', gameOverEvent);
      }

      // Send updated time information to all players
      this.server.to(checkTimeDto.gameId.toString()).emit('timeUpdate', {
        gameId: checkTimeDto.gameId,
        whiteTimeRemaining: gameState.whiteTimeRemaining,
        blackTimeRemaining: gameState.blackTimeRemaining,
        currentTime: gameState.currentTime,
      });

      return { event: 'checkTime', data: gameState };
    } catch (error) {
      this.logger.error('Error checking time:', error.message);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('offerDraw')
  async handleDrawOffer(
    @MessageBody() drawOfferDto: DrawOfferDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.offerDraw(
        drawOfferDto.gameId,
        client.data.userId,
      );

      // Notify the opponent about the draw offer
      this.server.to(drawOfferDto.gameId.toString()).emit('drawOffered', {
        gameId: game.id,
        offeredBy: client.data.userId,
      });

      return { event: 'offerDraw', data: game };
    } catch (error) {
      this.logger.error('Error offering draw:', error.message);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('respondToDraw')
  async handleDrawResponse(
    @MessageBody() drawResponseDto: DrawResponseDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.respondToDraw(
        drawResponseDto.gameId,
        client.data.userId,
        drawResponseDto.accept,
      );

      if (drawResponseDto.accept) {
        // If draw was accepted, emit game over event
        const gameOverEvent = {
          winner: null,
          reason: 'Draw by agreement',
          finalState: game,
        };
        this.server
          .to(drawResponseDto.gameId.toString())
          .emit('gameOver', gameOverEvent);
      } else {
        // If draw was declined, notify players
        this.server.to(drawResponseDto.gameId.toString()).emit('drawDeclined', {
          gameId: game.id,
          declinedBy: client.data.userId,
        });
      }

      return { event: 'respondToDraw', data: game };
    } catch (error) {
      this.logger.error('Error responding to draw:', error.message);
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Get the game to verify the sender is a player
      const game = await this.gameService.getGame(chatMessageDto.gameId);

      if (!game) {
        throw new WsException('Game not found');
      }

      // Verify sender is a player in the game
      if (
        game.whitePlayerId !== client.data.userId &&
        game.blackPlayerId !== client.data.userId
      ) {
        throw new WsException('You are not a player in this game');
      }

      // Only send to players in the game
      this.server.to(chatMessageDto.gameId.toString()).emit('chatMessage', {
        gameId: game.id,
        senderId: client.data.userId,
        message: chatMessageDto.message,
        timestamp: new Date().toISOString(),
      });

      return { event: 'chatMessage', data: 'Message sent successfully' };
    } catch (error) {
      this.logger.error('Error sending chat message:', error.message);
      throw new WsException(error.message);
    }
  }

  private getGameOverReason(game: any): string {
    if (game.isCheckmate) {
      return 'checkmate';
    } else if (game.isDraw) {
      return 'draw';
    } else if (
      game.status === 'completed' &&
      (game.whiteTimeRemaining <= 0 || game.blackTimeRemaining <= 0)
    ) {
      return 'timeout';
    }
    return 'resignation';
  }
}
