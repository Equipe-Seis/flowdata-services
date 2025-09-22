import { CheckingStatus } from '@prisma/client';

export class CheckingModel {
	constructor(
		public receiptDate?: Date,
		public status?: CheckingStatus,
	) {}
}
