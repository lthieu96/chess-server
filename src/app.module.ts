import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { SupabaseModule } from 'nestjs-supabase-js';
import { PuzzleModule } from './puzzle/puzzle.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
          },
        },
      },
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
    BlogPostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
