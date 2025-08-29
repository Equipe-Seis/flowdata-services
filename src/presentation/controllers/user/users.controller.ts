// src/presentation/controllers/user/users.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@application/services/user/user.service';
import { JwtGuard } from '@domain/shared/guard';
import { CreateUserDto } from '@application/dto/user/create-user.dto';
import type { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) { }

  // ✅ Cria um novo usuário
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  // ✅ Retorna o usuário logado com base no token
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = req.user?.['sub']; // ou req.user.id, dependendo do token
    return this.userService.getMe(userId);
  }

  // ✅ Busca um usuário por ID
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}
