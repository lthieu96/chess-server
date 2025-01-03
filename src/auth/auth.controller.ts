import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './guards/public.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActiveUser } from './guards/active-user.guard';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() adminLoginData: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginData);
  }

  @Post('guest')
  @Public()
  createGuestUser() {
    return this.authService.createGuestUser();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@ActiveUser('sub') userId) {
    return this.authService.getProfile(userId);
  }
}
