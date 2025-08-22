import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './DTO';

import { mapToPresentationResult } from 'src/domain/shared/result';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    const result = await this.authService.signin(dto);
    return mapToPresentationResult(result);
  }
}
