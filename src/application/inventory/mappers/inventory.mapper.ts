import { InventoryResponseDto, InventoryResponseItemSupplierDto, InventoryResponseSupplyItemDto } from "@application/inventory/dto/inventory-response.dto";
import { InventSumWithSupplyItemAndSupplier } from "@domain/inventory/types/inventSumWithSupplyItem";
import { SupplyItemWithSupplier } from "@domain/supply-item/types/supplyItemSupplier";
import { Supplier } from "@prisma/client";

export class InventoryMapper {
    static fromEntity(model: InventSumWithSupplyItemAndSupplier): InventoryResponseDto {
        return new InventoryResponseDto(
            model.id,
            model.unitOfMeasure,
            model.updatedAt,
            InventoryMapper.fromEntitySupplyItem(model.supplyItem) 
        )
    }

    static fromEntitySupplyItem(model: SupplyItemWithSupplier): InventoryResponseSupplyItemDto {
        return new InventoryResponseSupplyItemDto(
            model.id,
            model.name,
            model.code,
            model.status,
            InventoryMapper.fromEntityItemSupplier(model.supplier), 
            model.description,
        )
    }

    static fromEntityItemSupplier(model: Supplier): InventoryResponseItemSupplierDto {
        return new InventoryResponseItemSupplierDto(
            model.id,
            model.tradeName
        )
    }
}