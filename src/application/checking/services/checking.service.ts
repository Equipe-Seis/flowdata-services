import { CheckingResponseDto } from '@application/checking/dto/checking-response.dto';
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { Result } from '@domain/shared/result/result.pattern';
import { Inject, Injectable, Res } from '@nestjs/common';

@Injectable()
export class CheckingService {
	constructor(
		@Inject(ICheckingRepository)
		private checkingRepository: ICheckingRepository,
	) {}

	async create(dto: CreateCheckingDto): Promise<Result<CheckingResponseDto>> {
		const model = CheckingMapper.toModel(dto);

		const result = await this.checkingRepository.create(model);

		if (result.isFailure) {
			return Result.Fail<CheckingResponseDto>(result.getError());
		}

		const response = CheckingMapper.fromEntity(
			result.getValue() as CheckingWithLines,
		);

		return Result.Ok(response);
	}

	async addLine(
		dto: CreateCheckingLineDto[],
	): Promise<Result<CheckingResponseDto>> {
		const first = dto[0];

		if (!dto.every((x) => x.checkingId == first.checkingId)) {
			return Result.Fail(
				'Todas as linhas devem pertencer ao mesmo recebimento.',
			);
		}

		const models = dto.map(CheckingMapper.toLinesModel);

		const result = await this.checkingRepository.addLines(
			first.checkingId,
			models,
		);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return Result.Ok(CheckingMapper.fromEntity(result.getValue()));
	}

	async deleteLine(
		checkingId: number,
		lineId: number,
	): Promise<Result<CheckingResponseDto>> {
		if (!checkingId) {
			return Result.BadRequest('Numero de recebimento invalido.');
		}

		if (!lineId) {
			return Result.BadRequest('Numero de linha de recebimento invalido.');
		}

		const checking = await this.findById(checkingId);

		if (checking.isFailure) {
			return Result.NotFound(checking.getError());
		}

		const result = await this.checkingRepository.deleteLine(checkingId, lineId);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return Result.Ok(CheckingMapper.fromEntity(result.getValue()));
	}

	async updateLine(
		checkingId: number,
		lineId: number,
		dto: UpdateCheckingLineDto,
	): Promise<Result<CheckingResponseDto>> {
		if (!checkingId) {
			return Result.BadRequest('Numero de recebimento invalido.');
		}

		if (!lineId) {
			return Result.BadRequest('Numero de linha de recebimento invalido.');
		}

		const checking = await this.findById(checkingId);

		if (checking.isFailure) {
			return Result.NotFound(checking.getError());
		}

		const model = CheckingMapper.toUpdateLinesModel(dto);

		const result = await this.checkingRepository.updateLine(
			checkingId,
			lineId,
			model,
		);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return Result.Ok(CheckingMapper.fromEntity(result.getValue()));
	}

	async findById(id: number): Promise<Result<CheckingResponseDto | null>> {
		const result = await this.checkingRepository.findById(id);

		if (result.isFailure) {
			return Result.Fail(result.getError());
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
