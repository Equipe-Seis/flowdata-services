export class SupplyItemDto {
	constructor(
		public id: number,
		public name: string,
		public code: string,
		public price: number,
		public unitOfMeasure: string,
		public description: string | null,
		public supplier: SupplyItemSuplierDto,
	) {}
}

export class SupplyItemSuplierDto {
	constructor(
		public id: number,
		public createdAt: Date,
		public tradeName: string | null,
		public openingDate: Date | null,
		public type: string | null,
		public size: string | null,
		public legalNature: string | null,
		public personId: number,
	) {}
}

