import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { UsersController } from '@presentation/controllers/user/users.controller';
import { SupplyItemController } from '@presentation/supply-item/rest/supply-item.controller';
import { AuthController } from '@presentation/auth/rest/auth.controller';

@Module({
	imports: [ApplicationModule],
	controllers: [AuthController, SupplyItemController],
})
export class PresentationModule { }
