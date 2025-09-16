import { Global, Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ConfigModule } from '@nestjs/config';
import { DomainModule } from './domain/domain.module';
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './presentation/shared/guard/jwt.guard';
import { PermissionGuard } from '@presentation/shared/guard/permission.guard';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DomainModule,
		InfrastructureModule,
		ApplicationModule,
		PresentationModule,
	],
	providers: [
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
export class AppModule {}
