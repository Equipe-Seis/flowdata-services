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
import { CheckingService } from '@application/checking/services/checking.service';
import { ScheduleModule } from '@nestjs/schedule';
import { InventJobService } from '@application/inventory/services/jobs/invent-job.service';
import { SearchCnpjService } from '@/application/shared/cnpj/services/search-cnpj.service';
import { InventoryService } from '@application/inventory/services/inventory.service';

@Module({
	imports: [
		InfrastructureModule,
		DomainModule,
		JwtModule.register({}),
		ScheduleModule.forRoot({}),
	],
	providers: [
		AuthService,
		SupplyItemService,
		UserService,
		UserAccessService,
		ProfileService,
		SupplierService,
		AuthorizationService,
		CheckingService,
		InventJobService,
		SearchCnpjService,
		InventoryService,
	],
	exports: [
		AuthService,
		SupplyItemService,
		UserService,
		UserAccessService,
		ProfileService,
		SupplierService,
		AuthorizationService,
		CheckingService,
		SearchCnpjService,
		InventoryService,
	],
})
export class ApplicationModule {}
