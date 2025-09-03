import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JwtModule } from '@nestjs/jwt';
import { DomainModule } from '@domain/domain.module';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';
import { AuthService } from '@application/auth/services/auth.service';

@Module({
	imports: [InfrastructureModule, DomainModule, JwtModule.register({})],
	providers: [AuthService, SupplyItemService],
	exports: [AuthService, SupplyItemService],
})
export class ApplicationModule {}
