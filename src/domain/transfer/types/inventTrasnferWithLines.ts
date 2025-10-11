import { Prisma } from "@prisma/client";

export type InventTransferWithLines = Prisma.InventTransferGetPayload<{
  include: { inventTransferLines: true };
}>;
