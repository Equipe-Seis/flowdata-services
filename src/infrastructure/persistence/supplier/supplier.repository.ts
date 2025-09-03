import { Injectable } from '@nestjs/common';
import type { Supplier } from '@domain/supplier/supplier.entity';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';

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

