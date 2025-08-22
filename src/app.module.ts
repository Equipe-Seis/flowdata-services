import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [AuthModule, InfrastructureModule, ConfigModule.forRoot(), ApplicationModule, DomainModule, PresentationModule],
  providers: [PrismaService],
})

export class AppModule {}
