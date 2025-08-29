import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { SignInDto, SignUpDto } from 'src/application/auth/dto';
import { AuthService } from 'src/application/auth/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    const result = await this.authService.signup(dto);
    return result.mapToPresentationResult();
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    const result = await this.authService.signin(dto);
    return result.mapToPresentationResult();
  }
}
