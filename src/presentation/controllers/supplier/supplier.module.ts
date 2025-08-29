import { Module } from '@nestjs/common';
import { SupplierController } from '@presentation/controllers/supplier/supplier.controller';
import { SupplierService } from '@application/services/supplier/supplier.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    controllers: [SupplierController],
    providers: [SupplierService],
})
export class SupplierModule { }