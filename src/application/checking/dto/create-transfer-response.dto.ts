import { TransferType, UnitOfMeasure } from "@prisma/client";

export class CreateTransferResponseDto {
    constructor(
        public id: number,
        public transferType: TransferType,
        public inventTransferLines: CreateTransferLineResponseDto[] 
    ) {}
}

export class CreateTransferLineResponseDto {
    constructor(
        public id: number,
        public supplyItemId: number,
        public unitOfMeasure: UnitOfMeasure,
        public transferQty: number,
        public checkingLineId: number | null
    ) {}
}