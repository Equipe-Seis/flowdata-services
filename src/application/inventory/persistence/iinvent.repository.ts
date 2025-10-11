import { InventSumWithSupplyItemAndSupplier } from "@domain/inventory/types/inventSumWithSupplyItem"
import { Result } from "@domain/shared/result/result.pattern"

export interface IInventoryRepository {
   findAll(): Promise<Result<InventSumWithSupplyItemAndSupplier[]>> 
}

export const IInventoryRepository = Symbol('IInventoryRepository')