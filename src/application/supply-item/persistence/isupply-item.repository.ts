import { FindAllSuppliesDto } from '@application/supply-item/dto/find-all-supplies.dto';
import { Result } from '@domain/shared/result/result.pattern';
import { SupplyItemModel } from '@domain/supply-item/models/supply-item.model';
import { SupplyItemWithSupplier } from '@domain/supply-item/types/supplyItemSupplier';
import { SupplyItem } from '@prisma/client';

export interface ISupplyItemRepository {
	create(item: SupplyItemModel): Promise<Result<SupplyItem>>;

	getAll(
		filters: FindAllSuppliesDto,
	): Promise<Result<Array<SupplyItemWithSupplier>>>;

	getById(id: number): Promise<Result<SupplyItemWithSupplier | null>>;

	getByCode(code: string): Promise<Result<SupplyItemWithSupplier | null>>;

	update(id: number, item: SupplyItemModel): Promise<Result<SupplyItem>>;
}

export const ISupplyItemRepository = Symbol('ISupplyItemRepository');
