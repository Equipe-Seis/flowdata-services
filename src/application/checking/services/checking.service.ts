import { CheckingResponseDto } from '@application/checking/dto/checking-response.dto';
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { CreateTransferResponseDto } from '@application/checking/dto/create-transfer-response.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { Result } from '@domain/shared/result/result.pattern';
import { Inject, Injectable } from '@nestjs/common';
import { CheckingStatus, TransferType } from '@prisma/client';

@Injectable()
export class CheckingService {
	constructor(
		@Inject(ICheckingRepository)
		private checkingRepository: ICheckingRepository,
	) {}

	async revertChecking(id: number): Promise<Result<CreateTransferResponseDto>> {
		const checkingResult = await this.findById(id);

		if (checkingResult.isFailure) {
			return Result.Fail(checkingResult.getError());
		}

		const checking = checkingResult.getValue()!;

		if (checking.status !== CheckingStatus.received) {
			return Result.BadRequest(
				`Não é possivel reverter o recebimento ${id} no status ${checking.status}`,
			);
		}

		if (checking.lines.length === 0) {
			return Result.BadRequest(
				`Não é possivel reverter o recebimento ${id} com 0 linhas`,
			);
		}

		const createTransferResult = await this.checkingRepository.createTransfer({
			transferType: TransferType.outbound,
		});

		if (createTransferResult.isFailure) {
			return Result.Fail(checkingResult.getError());
		}

		const transfer = createTransferResult.getValue()!;

		const lines = checking.lines.map(CheckingMapper.toInventTransferLineModel);

		const createLinesResult = await this.checkingRepository.createTransferLines(
			transfer.id,
			lines,
		);

		if (createTransferResult.isFailure) {
			return Result.Fail(createLinesResult.getError());
		}

		const updateStatusResult =
			await this.checkingRepository.updateCheckingStatus(
				id,
				CheckingStatus.cancelled,
			);

		if (updateStatusResult.isFailure) {
			return Result.Fail(
				`Falha ao atualizar o status do recebimento: ${createLinesResult.getError()}`,
			);
		}

		const transferResult = await this.checkingRepository.findTransferById(
			transfer.id,
		);

		if (transferResult.isFailure) {
			return Result.Fail(
				`Transferência criada, mas ocorreu um erro ao buscar os dados finais: ${transferResult.getError()}`,
			);
		}

		const transferData = transferResult.getValue()!;

		return Result.Ok(CheckingMapper.toCreateTransferResponseDto(transferData));
	}

	// TODO: create unit of work
	async concludeChecking(
		id: number,
	): Promise<Result<CreateTransferResponseDto>> {
		const checkingResult = await this.findById(id);

		if (checkingResult.isFailure) {
			return Result.Fail(checkingResult.getError());
		}

		const checking = checkingResult.getValue()!;

		if (checking.status !== CheckingStatus.draft) {
			return Result.BadRequest(
				`Não é possivel processar o recebimento ${id} no status ${checking.status}`,
			);
		}

		if (checking.lines.length === 0) {
			return Result.BadRequest(
				`Não é possivel processar o recebimento ${id} com 0 linhas`,
			);
		}

		const createTransferResult = await this.checkingRepository.createTransfer({
			transferType: TransferType.inbound,
		});

		if (createTransferResult.isFailure) {
			return Result.Fail(checkingResult.getError());
		}

		const transfer = createTransferResult.getValue()!;

		const lines = checking.lines.map(CheckingMapper.toInventTransferLineModel);

		const createLinesResult = await this.checkingRepository.createTransferLines(
			transfer.id,
			lines,
		);

		if (createTransferResult.isFailure) {
			return Result.Fail(createLinesResult.getError());
		}

		const updateStatusResult =
			await this.checkingRepository.updateCheckingStatus(
				id,
				CheckingStatus.received,
			);

		if (updateStatusResult.isFailure) {
			return Result.Fail(
				'Falha ao atualizar o status do recebimento: ' +
					createLinesResult.getError(),
			);
		}

		const transferResult = await this.checkingRepository.findTransferById(
			transfer.id,
		);

		if (transferResult.isFailure) {
			return Result.Fail(
				'Transferência criada, mas ocorreu um erro ao buscar os dados finais: ' +
					transferResult.getError(),
			);
		}

		const transferData = transferResult.getValue()!;

		return Result.Ok(CheckingMapper.toCreateTransferResponseDto(transferData));
	}

	async delete(id: number): Promise<Result<number>> {
		const checkingResult = await this.findById(id);

		if (checkingResult.isFailure) {
			return Result.Fail(checkingResult.getError());
		}

		const checking = checkingResult.getValue()!;

		if (checking.status != 'draft') {
			return Result.Fail(
				`Nao é possivel deletar uma conferência no status ${checking.status}`,
			);
		}

		return this.checkingRepository.delete(checking.id);
	}

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
