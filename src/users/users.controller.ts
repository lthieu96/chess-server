import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ActiveUser } from '@/auth/guards/active-user.guard';

@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Roles('user', 'admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser('sub') userId: number,
    @ActiveUser('role') userRole: string,
  ) {
    // Only admins can update roles
    if (updateUserDto.role && userRole !== 'admin') {
      throw new Error('Only admins can update user roles');
    }

    // Regular users can only update their own info
    if (userRole !== 'admin' && userId !== +id) {
      throw new Error('You can only update your own user');
    }

    return this.usersService.update(+id, updateUserDto);
  }

  @Roles('user', 'admin')
  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @ActiveUser('sub') userId: number,
    @ActiveUser('role') userRole: string,
  ) {
    // Regular users can only update their own password
    if (userRole !== 'admin' && userId !== +id) {
      throw new Error('You can only update your own password');
    }
    return this.usersService.updatePassword(+id, updatePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/block')
  blockUser(@Param('id') id: string, @ActiveUser('sub') adminId: number) {
    return this.usersService.blockUser(+id, adminId);
  }

  @Post(':id/unblock')
  unblockUser(@Param('id') id: string, @ActiveUser('sub') adminId: number) {
    return this.usersService.unblockUser(+id, adminId);
  }
}
