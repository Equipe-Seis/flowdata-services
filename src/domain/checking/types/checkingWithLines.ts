import { Prisma } from "@prisma/client";

export type CheckingWithLines = Prisma.CheckingGetPayload<{
	include: { lines: true };
}>;

export type CheckingWithSupplyItem = Prisma.CheckingGetPayload<{
	include: {
		lines: {
			include: {
				supplyItem: true;
			};
		};
	};
}>;

export type CheckingLineWithSupplyItem = Prisma.CheckingLineGetPayload<{
	include: {
		supplyItem: true;
	};
}>;