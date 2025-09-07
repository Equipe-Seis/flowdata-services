import { SupplierModel } from '@domain/supplier/models/supplier.model';

export interface ISupplierRepository {
	create(supplier: Partial<SupplierModel>): Promise<SupplierModel>;
	findAll(): Promise<SupplierModel[]>;
	findById(id: number): Promise<SupplierModel | null>;
}
