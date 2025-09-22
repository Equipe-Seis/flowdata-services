import { UnitOfMeasure } from '@prisma/client';

export class CheckingLineModel {
	constructor(
		public supplyItemId: number,
		public receivedQty: number,
		public unitOfMeasure: UnitOfMeasure,
	) {}
}
