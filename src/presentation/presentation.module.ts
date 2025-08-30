import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { UsersController } from '@presentation/controllers/user/users.controller';
import { AuthController } from '@presentation/controllers/auth/auth.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UsersController, AuthController],
})
export class PresentationModule { }
