import { Supplier } from '@domain/supplier/supplier.entity';

export abstract class ISupplierRepository {
    abstract create(supplier: Partial<Supplier>): Promise<Supplier>;
    abstract findAll(): Promise<Supplier[]>;
    abstract findById(id: number): Promise<Supplier | null>;
}
