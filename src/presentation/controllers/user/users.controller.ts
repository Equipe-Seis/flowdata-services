import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from 'src/application/services/user/user.service';
import { JwtGuard } from 'src/domain/shared/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('me')
  me() {
    return this.userService.getMe();
  }
}
