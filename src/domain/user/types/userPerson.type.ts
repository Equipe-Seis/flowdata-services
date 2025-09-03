import { Person, Prisma, User } from "@prisma/client";

export type UserWithPerson = Prisma.UserGetPayload<{
  include: { person: true };
}>