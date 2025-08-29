import { SupplyItemModel } from 'src/domain/supply-item/models/supply-item.model';
import { CreateSupplyDto } from '../dto';
import { SupplyItemDto } from '../dto/supply-item.dto';
import { SupplyItem } from 'generated/prisma';

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
