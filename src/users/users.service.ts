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
    return this.drizzleService.db.select().from(users).orderBy(users.id);
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
    const { username, password, role } = updateUserDto;

    // Validate that at least one field is being updated
    if (!username && !password && !role) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    try {
      const updateData = {
        ...(username && { username }),
        ...(password && { password: await hash(password, 10) }),
        ...(role && { role }),
      };

      const updatedUsers = await this.drizzleService.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          role: users.role,
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

  async blockUser(id: number, adminId: number) {
    const userToBlock = await this.findOne(id);
    const admin = await this.findOne(adminId);

    if (admin.role !== 'admin') {
      throw new BadRequestException('Only admins can block users');
    }

    if (userToBlock.role === 'admin') {
      throw new BadRequestException('Cannot block admin users');
    }

    await this.drizzleService.db
      .update(users)
      .set({ blocked: true })
      .where(eq(users.id, id));

    return this.findOne(id);
  }

  async unblockUser(id: number, adminId: number) {
    const admin = await this.findOne(adminId);

    if (admin.role !== 'admin') {
      throw new BadRequestException('Only admins can unblock users');
    }

    await this.drizzleService.db
      .update(users)
      .set({ blocked: false })
      .where(eq(users.id, id));

    return this.findOne(id);
  }

  async isBlocked(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    return user.blocked!;
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
