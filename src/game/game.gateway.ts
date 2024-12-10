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
import { JoinGameDto, MoveGameDto } from './dto/socket-events.dto';
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

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      const userSockets = this.userSockets.get(client.data.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(client.data.userId);
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
      this.server.to(moveGameDto.gameId.toString()).emit('gameState', game);

      if (game.isGameOver) {
        this.server.to(moveGameDto.gameId.toString()).emit('gameOver', {
          winner: game.winner,
          reason: this.getGameOverReason(game),
        });
      }

      return { event: 'move', data: game };
    } catch (error) {
      this.logger.error('Error handling move:', error.message);
      throw new WsException(error.message);
    }
  }

  private getGameOverReason(game: any): string {
    if (game.isCheckmate) return 'checkmate';
    if (game.isDraw) return 'draw';
    if (game.isStalemate) return 'stalemate';
    if (game.isThreefoldRepetition) return 'threefold repetition';
    if (game.isInsufficientMaterial) return 'insufficient material';
    return 'unknown';
  }
}
