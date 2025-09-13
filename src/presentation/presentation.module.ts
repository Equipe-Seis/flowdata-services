import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { SupplyItemController } from '@presentation/supply-item/rest/supply-item.controller';
import { AuthController } from '@presentation/auth/rest/auth.controller';
import { UsersController } from '@presentation/user/rest/users.controller';
import { ProfileController } from '@presentation/profile/rest/profile.controller';
import { SupplierController } from '@presentation/supplier/rest/supplier.controller';

@Module({
	imports: [ApplicationModule, InfrastructureModule],
	controllers: [AuthController, SupplyItemController, UsersController, ProfileController, SupplierController],
})
export class PresentationModule { }