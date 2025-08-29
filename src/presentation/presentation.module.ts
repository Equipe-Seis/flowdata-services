import { Module } from '@nestjs/common';
import { ApplicationModule } from 'src/application/application.module';
import { AuthController } from './auth/rest/auth.controller';
import { SupplyItemController } from './supply-item/rest/supply-item.controller';

@Module({
	imports: [ApplicationModule],
	controllers: [AuthController, SupplyItemController],
})
export class PresentationModule {}
