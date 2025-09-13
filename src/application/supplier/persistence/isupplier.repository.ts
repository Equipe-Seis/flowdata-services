import { Result } from '@domain/shared/result/result.pattern';
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { Person, Supplier } from '@prisma/client';
import { SupplierWithPerson } from '@domain/supplier/types/supplierPerson.type';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';

export interface ISupplierRepository {

	findAll(page: number, limit: number): Promise<{ data: SupplierSummary[]; total: number }>;

	create(user: SupplierModel, personId: number): Promise<Result<Supplier>>;

	findById(id: number): Promise<Result<SupplierWithPerson | null>>;

	findByEmail(email: string): Promise<Result<SupplierWithPerson | null>>;

	findByDocumentNumber(documentNumber: string): Promise<Result<SupplierWithPerson | null>>;

	update(id: number, user: SupplierModel): Promise<Result<SupplierWithPerson | null>>;

	delete(id: number): Promise<Result<void>>;
}
export const ISupplierRepository = Symbol('ISupplierRepository');