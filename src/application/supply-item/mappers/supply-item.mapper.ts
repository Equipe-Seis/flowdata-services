import { CreateSupplyDto } from '@application/supply-item/dto';
import { SupplyItemDto } from '@application/supply-item/dto/supply-item.dto';
import { SupplyItemModel } from '@domain/supply-item/models/supply-item.model';
import { SupplyItem } from '@prisma/client';

export class SupplyItemMapper {
	static toModel(dto: CreateSupplyDto): SupplyItemModel {
		return new SupplyItemModel(dto.name, dto.code, dto.price, dto.description);
	}

	static fromEntity(entity: SupplyItem): SupplyItemDto {
		return new SupplyItemDto(
			entity.id,
			entity.name,
			entity.code,
			entity.price,
			entity.description,
		);
	}
}
