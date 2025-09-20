import { Prisma } from "@prisma/client";

export type CheckingWithLines = Prisma.CheckingGetPayload<{
  include: { lines: true };
}>;
