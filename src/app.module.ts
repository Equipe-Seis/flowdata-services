import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    InfrastructureModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DomainModule,
    PresentationModule,
    ApplicationModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
