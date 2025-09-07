import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { SupplyItemController } from '@presentation/supply-item/rest/supply-item.controller';
import { AuthController } from '@presentation/auth/rest/auth.controller';
import { UsersController } from '@presentation/user/rest/users.controller';

@Module({
	imports: [ApplicationModule],
	controllers: [AuthController, SupplyItemController, UsersController],
})
export class PresentationModule {}
