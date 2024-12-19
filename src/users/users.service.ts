import { DrizzleService } from './../database/drizzle.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users } from 'src/database/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.drizzleService.db.select().from(users);
  }

  async findOne(id: number) {
    const user = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then((results) => results[0]);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;

    // Validate that at least one field is being updated
    if (!username && !password) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    try {
      const updateData = {
        ...(username && { username }),
        ...(password && { password: await hash(password, 10) }),
      };

      const updatedUsers = await this.drizzleService.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
        });

      const user = updatedUsers[0];
      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        throw new ConflictException('Username already exists');
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getPlayerById(id: number) {
    const { id: playerId, username, rating } = getTableColumns(users);
    const player = await this.drizzleService.db
      .select({
        id: playerId,
        username,
        rating,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then((results) => results[0]);

    if (!player) {
      throw new NotFoundException(`Player #${id} not found`);
    }

    return player;
  }
}
