export class SupplyItemDto {
	constructor(
		public id: number,
		public name: string,
		public code: string,
		public price: number,
		public description: string | null,
	) {}
}
