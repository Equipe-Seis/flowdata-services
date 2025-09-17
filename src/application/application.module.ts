import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '@domain/domain.module';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';
import { AuthService } from '@application/auth/services/auth.service';
import { UserService } from '@application/user/services/user.service';
import { UserAccessService } from '@application/user/services/user-access.service';
import { ProfileService } from '@application/profile/services/profile.service';
import { SupplierService } from '@application/supplier/services/supplier.service';
import { AuthorizationService } from '@application/authorization/services/authorization.service';

@Module({
	imports: [InfrastructureModule, DomainModule, JwtModule.register({})],
	providers: [
		AuthService,
		SupplyItemService,
		UserService,
		UserAccessService,
		ProfileService,
		SupplierService,
		AuthorizationService,
	],
	exports: [
		AuthService,
		SupplyItemService,
		UserService,
		UserAccessService,
		ProfileService,
		SupplierService,
		AuthorizationService,
	],
})
export class ApplicationModule {}
