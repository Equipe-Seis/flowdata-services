import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from '@application/dto/supplier/create-supplier.dto';
import { Supplier } from '@domain/supplier/supplier.entity';
import { ISupplierRepository } from '@application/persistence/repository/interfaces/isupplier.repository';
import { PersonType, Status } from '@prisma/client';

@Injectable()
export class SupplierService {
    constructor(private readonly supplierRepository: ISupplierRepository) { }

    async createSupplier(dto: CreateSupplierDto) {
        const personDto = dto.person;

        // Aqui você pode setar os valores padrão ou vir do DTO, ajuste conforme seu domínio
        const personType = PersonType.INDIVIDUAL;
        const status = Status.ACTIVE;

        const supplierEntity = new Supplier(
            0, // id inicial (vai ser gerado no banco)
            personDto.name,
            personType,
            personDto.documentNumber,
            personDto.birthDate ? new Date(personDto.birthDate) : null,
            status,
            personDto.email ?? null,

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
