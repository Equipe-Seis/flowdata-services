//src\application\application.module.ts

import { Module } from '@nestjs/common';
import { UserService } from '@application/services/user/user.service';
import { AuthService } from '@application/services/auth/auth.service';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '@domain/domain.module';

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
