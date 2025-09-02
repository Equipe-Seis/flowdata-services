import { Module } from '@nestjs/common';
import { UserService } from '@application/services/user/user.service';
import { AuthService } from '@application/services/auth/auth.service';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '@domain/domain.module';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';

@Module({
	imports: [
		InfrastructureModule,
		DomainModule,
		JwtModule.register({}),
	],
	providers: [AuthService, SupplyItemService],
	exports: [AuthService, SupplyItemService],
})
export class ApplicationModule { }
