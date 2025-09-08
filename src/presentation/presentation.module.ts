import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { SupplyItemController } from '@presentation/supply-item/rest/supply-item.controller';
import { AuthController } from '@presentation/auth/rest/auth.controller';
import { UsersController } from '@presentation/user/rest/users.controller';

@Module({
	imports: [ApplicationModule, InfrastructureModule],
	controllers: [AuthController, SupplyItemController, UsersController],
})
export class PresentationModule { }