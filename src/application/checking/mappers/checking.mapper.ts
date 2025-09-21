import { CheckingLinesResponseDto, CheckingResponseDto } from "@application/checking/dto/checking-response.dto";
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';
import { CheckingLineModel } from '@domain/checking/models/checking-line.model';
import { CheckingModel } from '@domain/checking/models/checking.model';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { CheckingLine } from '@prisma/client';

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

	static fromLinesEntity(model: CheckingLine): CheckingLinesResponseDto {
		return new CheckingLinesResponseDto(
			model.id,
			model.supplyItemId,
			model.receivedQty.toNumber(),
			model.unitOfMeasure,
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
}