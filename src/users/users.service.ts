import { DrizzleService } from './../database/drizzle.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users as userSchema } from 'src/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.drizzleService.db.select().from(userSchema);
  }

  async findOne(id: number) {
    const user = await this.drizzleService.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1)
      .then((results) => results[0]);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getPlayerById(id: number) {
    const player = await this.drizzleService.db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        rating: userSchema.rating,
      })
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1)
      .then((results) => results[0]);

    if (!player) {
      throw new NotFoundException(`Player #${id} not found`);
    }

    return player;
  }
}
