import { CheckingStatus, UnitOfMeasure } from '@prisma/client';

export class CheckingResponseDto {
	constructor(
		public id: number,
		public receiptDate: Date,
		public status: CheckingStatus,
		public createdAt: Date,
		public lines: CheckingLinesResponseDto[],
	) {}
}

export class CheckingLinesResponseDto {
	constructor(
		public id: number,
		public supplyItemId: number,
		public receivedQty: number,
		public unitOfMeasure: UnitOfMeasure,
		public item?: CheckingLineItemResponseDto,
	) {}
}

export class CheckingLineItemResponseDto {
	constructor(
		public id: number,
		public name: string,
		public code: string,
		public description: string,
	) {}
}
