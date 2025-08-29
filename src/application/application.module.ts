//src\application\application.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from 'src/domain/domain.module';

@Module({
  imports: [
    InfrastructureModule,
    DomainModule,
    JwtModule.register({}),
  ],
  providers: [UserService, AuthService],
  exports: [UserService, AuthService],
})
export class ApplicationModule { }
