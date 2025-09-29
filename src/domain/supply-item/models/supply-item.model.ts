import { UnitOfMeasure } from '@prisma/client';

export class SupplyItemModel {
	constructor(
		public name: string,
		public code: string,
		public price: number,
		public supplierId: number,
		public description?: string,
		public unitOfMeasure?: UnitOfMeasure,
	) {}
}
