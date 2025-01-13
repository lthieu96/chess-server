import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Chess } from 'chess.js';
import { eq, and, or, desc, aliasedTable, inArray } from 'drizzle-orm';
import { DrizzleService } from 'src/database/drizzle.service';
import { games, users } from 'src/database/schema';

@Injectable()
export class GameService implements OnApplicationShutdown {
  constructor(private readonly drizzleService: DrizzleService) {}
  private activeGames: Map<number, Chess> = new Map();
  private drawOffers: Map<number, number> = new Map(); // gameId -> userId who offered draw

  async createGame(
    userId: number,
    options: {
      timeControl?: number;
      increment?: number;
      isPrivate?: boolean;
    } = {},
  ) {
    const chess = new Chess();
    const timeControl = options.timeControl || 600; // Default 10 minutes
    const increment = options.increment ?? 5; // Default 5 seconds increment, allow 0
    const isPrivate = options.isPrivate ?? false; // Default public game

    const [game] = await this.drizzleService.db
      .insert(games)
      .values({
        fen: chess.fen(),
        whitePlayerId: userId,
        timeControl,
        increment,
        isPrivate,
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

    let chess: Chess;
    if (this.activeGames.has(gameId)) {
      chess = this.activeGames.get(gameId)!;
      chess.load(game.fen);
    } else {
      chess = new Chess();
      chess.load(game.fen);
      this.activeGames.set(game.id, chess);
    }

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
        moves: game.moves ? `${game.moves},${move}` : move,
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

      return { ...updatedGame, lastMoveResult: moveResult };
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

  async offerDraw(gameId: number, userId: number) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
      throw new Error('User is not a player in this game');
    }

    // Store the draw offer
    this.drawOffers.set(gameId, userId);

    return game;
  }

  async respondToDraw(gameId: number, userId: number, accept: boolean) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const offeringUserId = this.drawOffers.get(gameId);
    if (!offeringUserId || offeringUserId === userId) {
      throw new Error('No valid draw offer to respond to');
    }

    // Clear the draw offer
    this.drawOffers.delete(gameId);

    if (accept) {
      // Update game status to draw
      const [updatedGame] = await this.drizzleService.db
        .update(games)
        .set({
          status: 'completed',
          winner: null, // null winner indicates draw
          isDraw: true,
        })
        .where(eq(games.id, gameId))
        .returning();

      return updatedGame;
    }

    return game;
  }

  async getPublicRooms() {
    const publicGames = await this.drizzleService.db
      .select({
        game: games,
        creator: {
          id: users.id,
          username: users.username,
          rating: users.rating,
        },
      })
      .from(games)
      .leftJoin(users, eq(games.whitePlayerId, users.id))
      .where(and(eq(games.status, 'waiting'), eq(games.isPrivate, false)));

    return publicGames.map(({ game, creator }) => ({
      ...game,
      creator,
    }));
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

  async getPlayersInGame(gameId: number) {
    const game = await this.drizzleService.db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const whitePlayer = game.whitePlayerId
      ? await this.drizzleService.db.query.users.findFirst({
          where: eq(users.id, game.whitePlayerId),
        })
      : null;

    const blackPlayer = game.blackPlayerId
      ? await this.drizzleService.db.query.users.findFirst({
          where: eq(users.id, game.blackPlayerId),
        })
      : null;
    return { whitePlayer, blackPlayer };
  }

  async getCompletedGamesForUser(userId: number) {
    // Create aliases for white and black player tables
    const whitePlayer = aliasedTable(users, 'white_player');
    const blackPlayer = aliasedTable(users, 'black_player');

    const completedGames = await this.drizzleService.db
      .select({
        id: games.id,
        status: games.status,
        whitePlayerId: games.whitePlayerId,
        blackPlayerId: games.blackPlayerId,
        winner: games.winner,
        isCheckmate: games.isCheckmate,
        isDraw: games.isDraw,
        moves: games.moves,
        createdAt: games.createdAt,
        whitePlayer: {
          id: whitePlayer.id,
          username: whitePlayer.username,
          rating: whitePlayer.rating,
        },
        blackPlayer: {
          id: blackPlayer.id,
          username: blackPlayer.username,
          rating: blackPlayer.rating,
        },
      })
      .from(games)
      .leftJoin(whitePlayer, eq(games.whitePlayerId, whitePlayer.id))
      .leftJoin(blackPlayer, eq(games.blackPlayerId, blackPlayer.id))
      .where(
        and(
          eq(games.status, 'completed'),
          or(eq(games.whitePlayerId, userId), eq(games.blackPlayerId, userId)),
        ),
      )
      .orderBy(desc(games.createdAt));

    return completedGames;
  }

  async handleDisconnect(userId: number) {
    // Find all games where the user is a player
    const userGames = await this.drizzleService.db.query.games.findMany({
      where: or(
        eq(games.whitePlayerId, userId),
        eq(games.blackPlayerId, userId),
      ),
    });

    for (const game of userGames) {
      if (game.status === 'waiting') {
        // If game is waiting and creator disconnects, delete the game
        if (game.whitePlayerId === userId) {
          await this.drizzleService.db
            .delete(games)
            .where(eq(games.id, game.id));

          // Clean up the chess instance
          this.activeGames.delete(game.id);
        }
      } else if (game.status === 'active') {
        // If game is active, other player wins
        const winner =
          game.whitePlayerId === userId
            ? game.blackPlayerId
            : game.whitePlayerId;

        const [updatedGame] = await this.drizzleService.db
          .update(games)
          .set({
            status: 'completed',
            winner: winner,
          })
          .where(eq(games.id, game.id))
          .returning();

        return {
          game: updatedGame,
          type: 'forfeit',
        };
      }
    }
  }

  async onApplicationShutdown() {
    // Clean up all incomplete games when server shuts down
    await this.drizzleService.db
      .update(games)
      .set({
        status: 'completed',
      })
      .where(and(or(eq(games.status, 'waiting'), eq(games.status, 'active'))));

    // Clear active games map
    this.activeGames.clear();
    this.drawOffers.clear();
  }
}
