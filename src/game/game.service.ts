import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { games, moves } from 'src/database/schema';

@Injectable()
export class GameService {
  constructor(private readonly drizzleService: DrizzleService) {}
  private activeGames: Map<string, Chess> = new Map();

  async createGame() {
    const chess = new Chess();
    const [game] = await this.drizzleService.db
      .insert(games)
      .values({
        status: 'waiting',
        fen: chess.fen(),
      })
      .returning();

    this.activeGames.set(game.id.toString(), chess);
    return game;
  }

  async joinGame(gameId: string, playerId: string) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, parseInt(gameId, 10)),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (!this.activeGames.has(gameId)) {
      const chess = new Chess();
      chess.load(game.fen);
      this.activeGames.set(game.id.toString(), chess);
    }

    // Update game status and player assignment logic here

    await this.drizzleService.db
      .update(games)
      .set({
        status: 'active',
        ...(game.whitePlayerId
          ? { blackPlayerId: playerId }
          : { whitePlayerId: playerId }),
      })
      .where(eq(games.id, parseInt(gameId, 10)));

    return game;
  }

  async makeMove(gameId: string, playerId: string, move: string) {
    const chess = this.activeGames.get(gameId);
    if (!chess) {
      throw new Error('Game not found');
    }

    try {
      chess.move(move);

      // Save move to database
      await this.drizzleService.db.insert(moves).values({
        gameId,
        playerId,
        move,
        fen: chess.fen(),
      } as any);

      // Update game state
      await this.drizzleService.db
        .update(games)
        .set({
          fen: chess.fen(),
          status: chess.isGameOver() ? 'completed' : 'active',
        })
        .where(eq(games.id, parseInt(gameId, 10)));

      return {
        fen: chess.fen(),
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        isGameOver: chess.isGameOver(),
        turn: chess.turn(),
      };
    } catch (error) {
      throw new Error('Invalid move');
    }
  }

  async getGame(gameId: string) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, parseInt(gameId, 10)),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }
}
