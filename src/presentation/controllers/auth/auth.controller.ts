//src\presentation\controllers\auth\auth.controller.ts

import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  SignInDto,
  SignUpDto,
} from '../../../application/dto';
import { AuthService } from '../../../application/services/auth/auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Result } from '@domain/shared/result/result.pattern'; // Importe o Result aqui

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  //@ApiOperation({ summary: 'Register a new user' })
  //@ApiResponse({ status: 201, description: 'User registered successfully' })
  //@Post('signup')
  //async signup(@Body() dto: SignUpDto) {
  //const result = await this.authService.signup(dto);
  //return this.handleResult(result);
  //}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    const result = await this.authService.signin(dto);
    return this.handleResult(result);
  }

  // Função para mapear o resultado
  private handleResult(result: Result<any>) {
    if (result.isFailure) {
      return result.mapToPresentationResult(); // Retorna o erro como exceção HTTP
    }
    return result.getValue(); // Retorna o valor de sucesso
  }
}
