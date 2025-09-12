import { Prisma } from '@prisma/client';

export type UserWithPerson = Prisma.UserGetPayload<{
	include: {
		person: true;
		userProfiles: {
			include: {
				profile: {
					include: {
						permissions: {
							include: {
								permission: true;
							};
						};
					};
				};
			};
		};
	};
}>;
