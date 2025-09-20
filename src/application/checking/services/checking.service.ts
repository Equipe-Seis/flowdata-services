import { CheckingResponseDto } from '@application/checking/dto/checking-response.dto';
import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { Result } from '@domain/shared/result/result.pattern';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckingService {
	constructor(
		@Inject(ICheckingRepository)
		private checkingRepository: ICheckingRepository,
	) {}

	async create(dto: CreateCheckingDto): Promise<Result<CheckingResponseDto>> {
		var model = CheckingMapper.toModel(dto);

		var result = await this.checkingRepository.create(model);

		if (result.isFailure) {
			return Result.Fail<CheckingResponseDto>(result.getError());
		}

		const response = CheckingMapper.fromEntity(
			result.getValue() as CheckingWithLines,
		);

		return Result.Ok(response);
	}

	async findById(id: number): Promise<Result<CheckingResponseDto | null>> {
		const result = await this.checkingRepository.findById(id);

		if (result.isFailure) {
			return Result.Fail<CheckingResponseDto>(result.getError());
		}

		const value = result.getValue();

		if (!value) {
			return Result.NotFound(
				`Não foram encontrados recebimentos para o Id ${id}`,
			);
		}

		return Result.Ok(CheckingMapper.fromEntity(value));
	}

	async findAll(): Promise<Result<CheckingResponseDto[]>> {
		const result = await this.checkingRepository.findAll();

		if (result.isFailure) {
			return Result.Fail<CheckingResponseDto[]>(result.getError());
		}

		const value = result.getValue();

		if (!value || value.length == 0) {
			return Result.NoContent();
		}

		const response = value.map(CheckingMapper.fromEntity);

		return Result.Ok(response);
	}
}
