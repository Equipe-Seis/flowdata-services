import { Module } from '@nestjs/common';
import { ApplicationModule } from 'src/application/application.module';
import { UsersController } from './controllers/user/users.controller';
import { AuthController } from './controllers/auth/auth.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UsersController, AuthController],
})
export class PresentationModule {}
