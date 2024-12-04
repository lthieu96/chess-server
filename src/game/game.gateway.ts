import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() gameId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.gameService.joinGame(gameId, client.id);
    client.join(gameId);
    this.server.to(gameId).emit('gameState', game);
  }

  @SubscribeMessage('move')
  async handleMove(
    @MessageBody() data: { gameId: string; move: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const game = await this.gameService.makeMove(
        data.gameId,
        client.id,
        data.move,
      );
      this.server.to(data.gameId).emit('gameState', game);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
}
