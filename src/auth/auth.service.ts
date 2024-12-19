import { JwtPayload } from './../../node_modules/@types/jsonwebtoken/index.d';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, getTableColumns, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DrizzleService } from 'src/database/drizzle.service';
import { users } from 'src/database/schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(emailOrUsername: string, password: string) {
    const user = await this.drizzleService.db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, emailOrUsername),
          eq(users.username, emailOrUsername),
        ),
      )
      .limit(1);

    if (!user[0]) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user[0];
  }

  async generateToken(user: typeof users.$inferSelect) {
    const payload: JwtPayload = {
      sub: user.id as unknown as string,
      email: user.email,
      role: user.role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async login(user: any) {
    return this.generateToken(user);
  }

  async register(userData: RegisterDto) {
    const existingUser = await this.drizzleService.db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, userData.email),
          eq(users.username, userData.username),
        ),
      )
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await this.drizzleService.db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    return {
      access_token: this.jwtService.sign({ sub: newUser[0].id }),
    };
  }

  async createGuestUser() {
    const newUser = await this.drizzleService.db
      .insert(users)
      .values({
        role: 'guest',
      } as any)
      .returning();

    return {
      access_token: this.jwtService.sign({ sub: newUser[0].id }),
    };
  }

  async getProfile(userId: number) {
    const { password, createdAt, ...rest } = getTableColumns(users);
    const user = await this.drizzleService.db
      .select({
        ...rest,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((results) => results[0]);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
