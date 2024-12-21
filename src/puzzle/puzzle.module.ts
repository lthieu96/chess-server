import { Module } from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { PuzzleController } from './puzzle.controller';
import { SupabaseModule } from 'nestjs-supabase-js';

@Module({
  imports: [SupabaseModule.injectClient()],
  providers: [PuzzleService],
  controllers: [PuzzleController],
})
export class PuzzleModule {}
