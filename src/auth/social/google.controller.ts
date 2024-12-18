import { Body, Controller, Post } from '@nestjs/common';
import { GoogleService } from './google.service';
import { Public } from '../guards/public.guard';
import { GoogleTokenDto } from '../dto/google-token.dto';

@Public()
@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleAuthService: GoogleService) {}

  @Post()
  authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenDto.token);
  }
}
