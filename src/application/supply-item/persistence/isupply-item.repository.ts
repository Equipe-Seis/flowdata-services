import { SupplyItem } from '@prisma/client';
import { Result } from 'src/domain/shared/result/result.pattern';
import { SupplyItemModel } from 'src/domain/supply-item/models/supply-item.model';

export interface ISupplyItemRepository {
	create(item: SupplyItemModel): Promise<Result<SupplyItem>>;

	getAll(): Promise<Result<Array<SupplyItem>>>;

	getById(id: number): Promise<Result<SupplyItem | null>>;

	update(id: number, item: SupplyItemModel): Promise<Result<SupplyItem>>;
}

export const ISupplyItemRepository = Symbol('ISupplyItemRepository');
