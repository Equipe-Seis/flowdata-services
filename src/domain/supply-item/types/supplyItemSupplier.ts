import { Prisma } from "@prisma/client";

export type SupplyItemWithSupplier = Prisma.SupplyItemGetPayload<{
  include: { supplier: true };
}>;
