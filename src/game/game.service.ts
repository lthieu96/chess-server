import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Chess } from 'chess.js';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { games, moves } from 'src/database/schema';

@Injectable()
export class GameService {
  constructor(private readonly drizzleService: DrizzleService) {}
  private activeGames: Map<number, Chess> = new Map();

  async createGame(
    userId: number,
    options: { timeControl?: number; increment?: number } = {},
  ) {
    const chess = new Chess();
    const timeControl = options.timeControl || 600; // Default 10 minutes
    const increment = options.increment ?? 5; // Default 5 seconds increment, allow 0

    const [game] = await this.drizzleService.db
      .insert(games)
      .values({
        fen: chess.fen(),
        whitePlayerId: userId,
        timeControl,
        increment,
        whiteTimeRemaining: timeControl,
        blackTimeRemaining: timeControl,
      })
      .returning();

    this.activeGames.set(game.id, chess);
    return game;
  }

  async joinGame(gameId: number, userId: number) {
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

  async makeMove(gameId: number, userId: number, move: string) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const isWhite = game.whitePlayerId == userId;
    const isBlack = game.blackPlayerId == userId;

    if (!isWhite && !isBlack) {
      throw new Error('User is not a player in this game');
    }

    const currentTurn = game.turn;
    if (
      (currentTurn === 'w' && !isWhite) ||
      (currentTurn === 'b' && !isBlack)
    ) {
      throw new Error('Not your turn');
    }

    // Check if player has run out of time
    const now = new Date();
    const lastMoveTime = game.lastMoveTime ? new Date(game.lastMoveTime) : now;
    const elapsedSeconds = Math.floor(
      (now.getTime() - lastMoveTime.getTime()) / 1000,
    );

    const currentPlayerTime =
      currentTurn === 'w' ? game.whiteTimeRemaining : game.blackTimeRemaining;
    const remainingTime = Math.max(0, currentPlayerTime! - elapsedSeconds);

    if (remainingTime <= 0) {
      // Player has lost on time
      await this.drizzleService.db
        .update(games)
        .set({
          status: 'completed',
          winner: currentTurn === 'w' ? game.blackPlayerId : game.whitePlayerId,
        })
        .where(eq(games.id, gameId));
      throw new Error('Game lost on time');
    }

    const chess = this.activeGames.get(gameId)!;
    chess.load(game.fen);

    try {
      const moveResult = chess.move(move);
      if (!moveResult) {
        throw new Error('Invalid move');
      }

      // Add increment time to the player who just moved
      const timeAfterIncrement = remainingTime + (game.increment || 0);

      // Update remaining time for the player who just moved
      const updates: any = {
        fen: chess.fen(),
        turn: chess.turn(),
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        lastMoveTime: now,
      };

      if (currentTurn === 'w') {
        updates.whiteTimeRemaining = timeAfterIncrement;
      } else {
        updates.blackTimeRemaining = timeAfterIncrement;
      }

      if (chess.isGameOver()) {
        updates.status = 'completed';
        if (chess.isCheckmate()) {
          updates.winner =
            currentTurn === 'w' ? game.whitePlayerId : game.blackPlayerId;
        }
      }

      const [updatedGame] = await this.drizzleService.db
        .update(games)
        .set(updates)
        .where(eq(games.id, gameId))
        .returning();

      await this.drizzleService.db.insert(moves).values({
        gameId,
        playerId: userId,
        move: moveResult.san,
        fen: chess.fen(),
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
      });

      return updatedGame;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async resignGame(gameId: number, userId: number) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    // Determine the winner based on who is resigning
    const winnerId =
      game.whitePlayerId == userId ? game.blackPlayerId : game.whitePlayerId;

    // Update the game status to completed
    await this.drizzleService.db
      .update(games)
      .set({
        status: 'completed',
        winner: winnerId,
      })
      .where(eq(games.id, gameId));

    return { winner: winnerId };
  }

  async checkTime(gameId: number) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const now = new Date();
    const lastMoveTime = game.lastMoveTime ? new Date(game.lastMoveTime) : now;
    const elapsedSeconds = Math.floor(
      (now.getTime() - lastMoveTime.getTime()) / 1000,
    );

    const currentPlayerTime =
      game.turn === 'w' ? game.whiteTimeRemaining : game.blackTimeRemaining;
    const remainingTime = Math.max(0, currentPlayerTime! - elapsedSeconds);

    if (remainingTime <= 0) {
      // Player has lost on time
      const winner =
        game.turn === 'w' ? game.blackPlayerId : game.whitePlayerId;
      const [updatedGame] = await this.drizzleService.db
        .update(games)
        .set({
          status: 'completed',
          winner,
          whiteTimeRemaining: game.turn === 'w' ? 0 : game.whiteTimeRemaining,
          blackTimeRemaining: game.turn === 'b' ? 0 : game.blackTimeRemaining,
        })
        .where(eq(games.id, gameId))
        .returning();

      return {
        ...updatedGame,
        timeExpired: true,
        currentTime: now.toISOString(),
      };
    }

    return {
      ...game,
      whiteTimeRemaining:
        game.turn === 'w' ? remainingTime : game.whiteTimeRemaining,
      blackTimeRemaining:
        game.turn === 'b' ? remainingTime : game.blackTimeRemaining,
      timeExpired: false,
      currentTime: now.toISOString(),
    };
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
