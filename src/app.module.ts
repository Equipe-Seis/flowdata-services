import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './domain/shared/guard/jwt.guard';
import { PermissionGuard } from '@infrastructure/auth/guards/permission.guard';
import { ProfileGuard } from '@infrastructure/auth/guards/profile.guard';
@Module({
  imports: [
    InfrastructureModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DomainModule,
    PresentationModule,
    ApplicationModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ProfileGuard,
    },
  ],
})
export class AppModule { }
