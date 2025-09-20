import { CheckingLinesResponseDto, CheckingResponseDto } from "@application/checking/dto/checking-response.dto";
import { CreateCheckingDto } from "@application/checking/dto/create-checking.dto";
import { CheckingModel } from "@domain/checking/models/checking.model";
import { CheckingWithLines } from "@domain/checking/types/checkingWithLines";
import { CheckingLine } from "@prisma/client";

export class CheckingMapper {
    static fromEntity(model: CheckingWithLines): CheckingResponseDto {
        return new CheckingResponseDto(
            model.id,
            model.receiptDate,
            model.status,
            model.createdAt,
            model.lines?.map(CheckingMapper.fromLinesEntity)
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

    static toModel(dto: CreateCheckingDto) : CheckingModel {
        return new CheckingModel(dto.receiptDate)
    }
}