import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { CreateSupplyDto } from '@application/supply-item/dto';
import { FindAllSuppliesDto } from '@application/supply-item/dto/find-all-supplies.dto';
import { SupplyItemDto } from '@application/supply-item/dto/supply-item.dto';
import { SupplyItemMapper } from '@application/supply-item/mappers/supply-item.mapper';
import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { Inject, Injectable, Res } from '@nestjs/common';

@Injectable()
export class SupplyItemService {
	constructor(
		@Inject(ISupplyItemRepository)
		private supplyItemRepository: ISupplyItemRepository,
		@Inject(ISupplierRepository)
		private supplierRepository: ISupplierRepository,
	) {}

	async getByCode(code: string): Promise<Result<SupplyItemDto>> {
		const result = await this.supplyItemRepository.getByCode(code);

		if (result.isFailure) {
			return Result.Fail<SupplyItemDto>(result.error!);
		}

		if (result.value) {
			return Result.Ok(SupplyItemMapper.fromEntity(result.value));
		}

		return Result.NotFound();
	}

	async createSupplyItem(dto: CreateSupplyDto): Promise<Result<number>> {
		const supplierResult = await this.supplierRepository.findById(
			dto.supplierId,
		);

		if (supplierResult.isFailure) {
			return Result.Fail(supplierResult.getError());
		}

		const supplier = supplierResult.getValue();

		if (!supplier) {
			return Result.BadRequest(
				'Fornecedor não cadastrado para o Id ' + dto.supplierId,
			);
		}

		const model = SupplyItemMapper.toModel(dto);
		const result = await this.supplyItemRepository.create(model);

		if (result.isFailure) {
			return Result.Fail<number>(result.error!);
		}

		return Result.Ok(result.getValue().id);
	}

	async getAll(
		filters: FindAllSuppliesDto,
	): Promise<Result<Array<SupplyItemDto>>> {
		const result = await this.supplyItemRepository.getAll(filters);

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
