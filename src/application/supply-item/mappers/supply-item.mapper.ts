import { CreateSupplyDto } from '@application/supply-item/dto';
import {
	SupplyItemDto,
	SupplyItemSuplierDto,
} from '@application/supply-item/dto/supply-item.dto';
import { SupplyItemModel } from '@domain/supply-item/models/supply-item.model';
import { SupplyItemWithSupplier } from '@domain/supply-item/types/supplyItemSupplier';

export class SupplyItemMapper {
	static toModel(dto: CreateSupplyDto): SupplyItemModel {
		return new SupplyItemModel(
			dto.name,
			dto.code,
			dto.price,
			dto.supplierId,
			dto.description,
		);
	}

	static toSupplierDto(
		supplier: SupplyItemWithSupplier['supplier'],
	): SupplyItemSuplierDto {
		return new SupplyItemSuplierDto(
			supplier.id,
			supplier.createdAt,
			supplier.tradeName,
			supplier.openingDate,
			supplier.type,
			supplier.size,
			supplier.legalNature,
			supplier.personId,
		);
	}

	static fromEntity(entity: SupplyItemWithSupplier): SupplyItemDto {
		return new SupplyItemDto(
			entity.id,
			entity.name,
			entity.code,
			entity.price,
			entity.description,
			SupplyItemMapper.toSupplierDto(entity.supplier),
		);
	}
}
