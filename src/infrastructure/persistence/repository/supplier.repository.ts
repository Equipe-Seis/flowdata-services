import { Injectable } from '@nestjs/common';
import { ISupplierRepository } from '@application/persistence/repository/interfaces/isupplier.repository';
import type { Supplier } from '@domain/supplier/supplier.entity';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
    async create(supplier: Supplier): Promise<Supplier> {
        // implemente a persistência aqui
        return supplier;
    }

    async findAll(): Promise<Supplier[]> {
        return [];
    }

    async findById(id: number): Promise<Supplier | null> {
        return null;
    }
}

