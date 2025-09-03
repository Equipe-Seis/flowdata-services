import { Supplier } from '@domain/supplier/supplier.entity';

export interface ISupplierRepository {
	create(supplier: Partial<Supplier>): Promise<Supplier>;
	findAll(): Promise<Supplier[]>;
	findById(id: number): Promise<Supplier | null>;
}
