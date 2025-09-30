import { Prisma } from '@prisma/client';

export type InventTransferLineWithTransfer =
	Prisma.InventTransferLineGetPayload<{
		include: { inventTransfer: true };
	}>;
