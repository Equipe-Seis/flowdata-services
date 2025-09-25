import { CheckingStatus, UnitOfMeasure } from '@prisma/client';

export const CheckingStatusDescription: Record<CheckingStatus, string> = {
	[CheckingStatus.draft]: 'Rascunho',
	[CheckingStatus.received]: 'Recebido',
	[CheckingStatus.cancelled]: 'Cancelado',
} as const;

export class CheckingResponseDto {
	public formattedReceiptDate: string;
	public formattedCreatedAt: string;
	public lineCount: number;
	public statusDescription: string;

	constructor(
		public id: number,
		public receiptDate: Date,
		public status: CheckingStatus,
		public createdAt: Date,
		public lines: CheckingLinesResponseDto[],
	) {
		this.formattedReceiptDate = this.receiptDate.toLocaleDateString('pt-BR');
		this.formattedCreatedAt = this.createdAt.toLocaleDateString('pt-BR');
		this.lineCount = this.lines?.length ?? 0;
		this.statusDescription = CheckingStatusDescription[this.status];
	}
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
