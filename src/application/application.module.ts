import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from 'src/domain/domain.module';
import { SupplyItemService } from './supply-item/services/supply-item.service';
import { AuthService } from './auth/services/auth.service';

@Module({
	imports: [
		InfrastructureModule,
		DomainModule,
		JwtModule.register({}),
	],
	providers: [AuthService, SupplyItemService],
	exports: [AuthService, SupplyItemService],
})
export class ApplicationModule {}
