import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Chess } from 'chess.js';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { games, moves } from 'src/database/schema';

@Injectable()
export class GameService {
  constructor(private readonly drizzleService: DrizzleService) {}
  private activeGames: Map<number, Chess> = new Map();

  async createGame(userId: string) {
    const chess = new Chess();
    const [game] = await this.drizzleService.db
      .insert(games)
      .values({
        fen: chess.fen(),
        whitePlayerId: userId,
      })
      .returning();

    this.activeGames.set(game.id, chess);
    return game;
  }

  async joinGame(gameId: number, userId: string) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting' && game.status !== 'active') {
      throw new Error('Game is not available to join');
    }

    if (game.whitePlayerId == userId || game.blackPlayerId == userId) {
      if (!this.activeGames.has(gameId)) {
        const chess = new Chess();
        chess.load(game.fen);
        this.activeGames.set(game.id, chess);
      }

      const chess = this.activeGames.get(gameId)!;
      console.log();
      return {
        ...game,
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        isGameOver: chess.isGameOver(),
        turn: chess.turn(),
      };
    }

    if (!this.activeGames.has(gameId)) {
      const chess = new Chess();
      chess.load(game.fen);
      this.activeGames.set(game.id, chess);
    }

    const updatedGame = await this.drizzleService.db
      .update(games)
      .set({
        status: 'active',
        blackPlayerId: userId,
      })
      .where(eq(games.id, gameId))
      .returning();

    return updatedGame[0];
  }

  async makeMove(gameId: number, userId: string, move: string) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const chess = this.activeGames.get(gameId);
    if (!chess) {
      throw new Error('Game not found in memory');
    }

    // Validate if it's player's turn
    const isWhiteTurn = chess.turn() === 'w';

    if (
      (isWhiteTurn && game.whitePlayerId !== userId.toString()) ||
      (!isWhiteTurn && game.blackPlayerId !== userId.toString())
    ) {
      throw new UnauthorizedException('Not your turn');
    }

    try {
      chess.move(move);

      // Save move to database
      await this.drizzleService.db.insert(moves).values({
        gameId,
        playerId: userId,
        move,
        fen: chess.fen(),
      });

      // Update game state
      const updatedGame = await this.drizzleService.db
        .update(games)
        .set({
          fen: chess.fen(),
          status: chess.isGameOver() ? 'completed' : 'active',
          winner: this.getWinner(chess, game),
        })
        .where(eq(games.id, gameId))
        .returning();

      return {
        ...updatedGame[0],
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

  private getWinner(chess: Chess, game: any) {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? game.blackPlayerId : game.whitePlayerId;
    }
    if (chess.isDraw()) {
      return 'draw';
    }
    return null;
  }

  async getGame(gameId: number) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const chess = this.activeGames.get(gameId);
    if (chess) {
      return {
        ...game,
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        isGameOver: chess.isGameOver(),
        turn: chess.turn(),
      };
    }

    return game;
  }
}
