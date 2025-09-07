import { Prisma } from '@prisma/client';

export type UserWithPerson = Prisma.UserGetPayload<{
	include: { person: true };
}>;
