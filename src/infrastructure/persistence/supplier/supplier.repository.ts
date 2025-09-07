import { Injectable } from '@nestjs/common';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierModel } from '@domain/supplier/models/supplier.model';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
	async create(supplier: SupplierModel): Promise<SupplierModel> {
		return supplier;
	}

	async findAll(): Promise<SupplierModel[]> {
		return [];
	}

	async findById(id: number): Promise<SupplierModel | null> {
		return null;
	}
}
