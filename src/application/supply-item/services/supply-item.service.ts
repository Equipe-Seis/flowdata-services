import { CreateSupplyDto } from '@application/supply-item/dto';
import { SupplyItemDto } from '@application/supply-item/dto/supply-item.dto';
import { SupplyItemMapper } from '@application/supply-item/mappers/supply-item.mapper';
import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SupplyItemService {
	constructor(
		@Inject(ISupplyItemRepository)
		private supplyItemRepository: ISupplyItemRepository,
	) {}

	async createSupplyItem(dto: CreateSupplyDto): Promise<Result<number>> {
		const model = SupplyItemMapper.toModel(dto);

		const result = await this.supplyItemRepository.create(model);

		if (result.isFailure) {
			return Result.Fail<number>(result.error!);
		}

		return Result.Ok(result.getValue().id);
	}

	async getAll(): Promise<Result<Array<SupplyItemDto>>> {
		const result = await this.supplyItemRepository.getAll();

		if (result.isFailure) {
			return Result.Fail<Array<SupplyItemDto>>(result.error!);
		}

		if (result.value) {
			return Result.Ok(result.value.map((x) => SupplyItemMapper.fromEntity(x)));
		}

		return Result.Ok([]);
	}

	async getById(id: number): Promise<Result<SupplyItemDto | null>> {
		const result = await this.supplyItemRepository.getById(id);

		if (result.isFailure) {
			return Result.Fail<SupplyItemDto>(result.error!);
		}

		if (result.value) {
			return Result.Ok(SupplyItemMapper.fromEntity(result.value));
		}

		return Result.Ok(null);
	}
}
