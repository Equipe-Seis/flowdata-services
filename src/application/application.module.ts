//src\application\application.module.ts

import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '@domain/domain.module';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';
import { AuthService } from '@application/auth/services/auth.service';
import { UserService } from '@application/user/user.service';
import { UserAccessService } from '@application/user/user-access.service';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { RedisService } from '@infrastructure/cache/redis.service';

@Module({
	imports: [InfrastructureModule, DomainModule, JwtModule.register({})],
	providers: [PrismaService, RedisService, AuthService, SupplyItemService, UserService, UserAccessService],
	exports: [PrismaService, RedisService, AuthService, SupplyItemService, UserService, UserAccessService],
})
export class ApplicationModule { }
