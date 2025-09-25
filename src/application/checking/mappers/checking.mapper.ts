import {
	CheckingLineItemResponseDto,
	CheckingLinesResponseDto,
	CheckingResponseDto,
} from '@application/checking/dto/checking-response.dto';
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import {
	CreateTransferLineResponseDto,
	CreateTransferResponseDto,
} from '@application/checking/dto/create-transfer-response.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';
import { CheckingLineModel } from '@domain/checking/models/checking-line.model';
import { CheckingModel } from '@domain/checking/models/checking.model';
import {
	CheckingLineWithSupplyItem,
	CheckingWithLines,
} from '@domain/checking/types/checkingWithLines';
import { InventTransferLineModel } from '@domain/transfer/models/invent-transfer-line.model';
import { InventTransferWithLines } from '@domain/transfer/types/inventTrasnferWithLines';
import { CheckingLine, InventTransferLine, SupplyItem } from '@prisma/client';

export class CheckingMapper {
	static fromEntity(model: CheckingWithLines): CheckingResponseDto {
		return new CheckingResponseDto(
			model.id,
			model.receiptDate,
			model.status,
			model.createdAt,
			model.lines?.map(CheckingMapper.fromLinesEntity),
		);
	}

	static fromLinesEntity(
		model: CheckingLineWithSupplyItem,
	): CheckingLinesResponseDto {
		return new CheckingLinesResponseDto(
			model.id,
			model.supplyItemId,
			model.receivedQty.toNumber(),
			model.unitOfMeasure,
			CheckingMapper.fromSupplyItemEntity(model.supplyItem),
		);
	}

	static fromSupplyItemEntity(model: SupplyItem) {
		return new CheckingLineItemResponseDto(
			model.id,
			model.name,
			model.code,
			model.description ?? '',
		);
	}

	static toLinesModel(dto: CreateCheckingLineDto): CheckingLineModel {
		return new CheckingLineModel(
			dto.supplyItemId,
			dto.receivedQty,
			dto.unitOfMeasure,
		);
	}

	static toUpdateLinesModel(
		dto: UpdateCheckingLineDto,
	): Partial<CheckingLineModel> {
		return { receivedQty: dto.receivedQty, unitOfMeasure: dto.unitOfMeasure };
	}

	static toModel(dto: CreateCheckingDto): CheckingModel {
		return new CheckingModel(dto.receiptDate);
	}

	static toInventTransferLineModel(dto: CheckingLinesResponseDto) {
		return new InventTransferLineModel(
			dto.receivedQty,
			dto.unitOfMeasure,
			dto.supplyItemId,
			dto.id,
		);
	}

	static toCreateTransferResponseDto(model: InventTransferWithLines) {
		return new CreateTransferResponseDto(
			model.id,
			model.transferType,
			model.inventTransferLines.map(
				CheckingMapper.toCreateTransferLineResponseDto,
			),
		);
	}

	static toCreateTransferLineResponseDto(model: InventTransferLine) {
		return new CreateTransferLineResponseDto(
			model.id,
			model.supplyItemId,
			model.unitOfMeasure,
			model.transferQty.toNumber(),
			model.checkingLineId,
		);
	}
}
