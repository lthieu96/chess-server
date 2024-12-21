import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { completedPuzzles } from 'src/database/schema';
import { eq } from 'drizzle-orm';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PuzzleService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly supabaseClient: SupabaseClient,
  ) {}

  async getRandomPuzzle(userId: number) {
    // Get IDs of completed puzzles for this user
    const completed = await this.drizzleService.db
      .select({ puzzleId: completedPuzzles.puzzleId })
      .from(completedPuzzles)
      .where(eq(completedPuzzles.userId, userId));

    const completedIds = completed.map((c) => c.puzzleId);

    // Get a random puzzle that hasn't been completed
    const { data: puzzles, error } = await this.supabaseClient
      .from('puzzles')
      .select('*')
      .not('id', 'in', `(${completedIds.join(',')})`)
      .order('id') // Order by id to ensure consistent pagination
      .limit(50) // Get a batch of records
      .then((result) => {
        if (result.error) return result;
        // Randomly select one puzzle from the batch
        const randomIndex = Math.floor(Math.random() * result.data.length);
        return {
          data: result.data.length ? [result.data[randomIndex]] : [],
          error: null,
        };
      });

    if (error || !puzzles.length) {
      throw new NotFoundException('No more puzzles available');
    }

    return puzzles[0];
  }

  async markPuzzleAsCompleted(userId: number, puzzleId: string) {
    await this.drizzleService.db.insert(completedPuzzles).values({
      userId,
      puzzleId,
    });
  }
}
