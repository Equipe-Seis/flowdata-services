import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { Supplier } from '@domain/supplier/supplier.entity';
import { PersonType, Status } from '@prisma/client';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';

@Injectable()
export class SupplierService {
    constructor(private readonly supplierRepository: ISupplierRepository) { }

    async createSupplier(dto: CreateSupplierDto) {
        const personDto = dto.person;

        const personType = PersonType.individual;
        const status = Status.active;

        const supplierEntity = new Supplier(
            personDto.name,
            personType,
            personDto.documentNumber,
            personDto.birthDate ? new Date(personDto.birthDate) : null,
            status,
            personDto.email,

            dto.tradeName,
            dto.openingDate ? new Date(dto.openingDate) : undefined,
            dto.type,
            dto.size,
            dto.legalNature,
        );

        return this.supplierRepository.create(supplierEntity);
    }

    async findAll() {
        return this.supplierRepository.findAll();
    }

    async findById(id: number) {
        return this.supplierRepository.findById(id);
    }
}
