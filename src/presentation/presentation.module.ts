import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { SupplyItemController } from '@presentation/supply-item/rest/supply-item.controller';
import { AuthController } from '@presentation/auth/rest/auth.controller';
import { UsersController } from '@presentation/user/rest/users.controller';
import { ProfileController } from '@presentation/profile/rest/profile.controller';
import { SupplierController } from '@presentation/supplier/rest/supplier.controller';
import { CheckingController } from '@presentation/checking/rest/checking.controller';
import { SearchCnpjController } from '@presentation/shared/cnpj/rest/search-cnpj.controller';
import { InventoryController } from '@presentation/inventory/rest/inventory.controller';

@Module({
	imports: [ApplicationModule],
	controllers: [
		AuthController,
		SupplyItemController,
		UsersController,
		ProfileController,
		SupplierController,
		CheckingController,
		SearchCnpjController,
		InventoryController,
	],
})
export class PresentationModule {}