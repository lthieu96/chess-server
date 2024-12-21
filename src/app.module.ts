import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { SupabaseModule } from 'nestjs-supabase-js';
import { PuzzleModule } from './puzzle/puzzle.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule.forRoot({
      supabaseKey: process.env.SUPABASE_KEY!,
      supabaseUrl: process.env.SUPABASE_URL!,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    GameModule,
    PuzzleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
