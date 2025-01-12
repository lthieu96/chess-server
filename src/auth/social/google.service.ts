import { DrizzleService } from '@/database/drizzle.service';
import { AuthService } from './../auth.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class GoogleService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly drizzleService: DrizzleService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);

      const { email } = tokenInfo;

      let dbUsers = await this.drizzleService.db
        .select()
        .from(users)
        .where(eq(users.email, email!))
        .limit(1);

      if (!dbUsers[0]) {
        const newUser = await this.drizzleService.db
          .insert(users)
          .values({ email, username: email!.split('@')[0] })
          .returning();
        dbUsers = newUser;
      }
      return this.authService.generateToken(dbUsers[0]);
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }
}
