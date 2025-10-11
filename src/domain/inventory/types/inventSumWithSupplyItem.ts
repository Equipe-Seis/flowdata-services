import { Prisma } from "@prisma/client";

export type InventSumWithSupplyItemAndSupplier = Prisma.InventSumGetPayload<{
	include: {
		supplyItem: {
            include: {
                supplier: true
            }
        };
	};
}>;