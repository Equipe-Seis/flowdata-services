
//src\infrastructure\persistence\user\user.repository.ts
import { Injectable } from '@nestjs/common';
import { UserModel } from '@domain/user/models/user.model';
import { Result } from '@domain/shared/result/result.pattern';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { User } from '@prisma/client';
import { UserWithPerson } from '@domain/user/types/userPerson.type';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { UserSummaryDto } from '@application/user/dto/user-summary.dto';

type PrismaUserWithPerson = {
	id: number;
	hash: string;
	person: {
		id: number;
		name: string;
		personType: any;
		documentNumber: string;
		birthDate: Date | null;
		status: any;
		email: string | null;
	};
	userProfiles: {
		profile: {
			id: number;
			name: string;
			description: string;
			permissions: {
				permission: {
					name: string;
				};
			}[];
		};
	}[];
};

function convertPrismaToUserWithPerson(prismaUser: PrismaUserWithPerson): UserWithPerson {
	return {
		id: prismaUser.id,
		hash: prismaUser.hash,
		person: PersonMapper.fromPrisma(prismaUser.person),
		userProfiles: prismaUser.userProfiles.map(up => ({
			profile: {
				id: up.profile.id,
				name: up.profile.name,
				description: up.profile.description,
				permissions: up.profile.permissions
			}
		}))
	};
}

@Injectable()
export class UserRepository
	extends PrismaRepository
	implements IUserRepository {

	async findAll(page: number, limit: number): Promise<{ data: UserSummaryDto[]; total: number }> {
		const skip = (page - 1) * limit;

		const [users, total] = await this.prismaService.$transaction([
			this.prismaService.user.findMany({
				skip,
				take: limit,
				select: {
					id: true,
					person: {
						select: {
							name: true,
							email: true,
						},
					},
				}
			}),
			this.prismaService.user.count(),
		]);

		const usersMapped = users.map(user => new UserSummaryDto(user.id, user.person.name, user.person.email));
		return {
			data: usersMapped,
			total,
		};
	}
	async create(user: UserModel, personId: number): Promise<Result<User>> {
		try {
			const createdUser = await this.prismaService.user.create({
				data: {
					personId: personId,
					hash: user.hash,
				},
			});

			if (user.profiles && user.profiles.length > 0) {
				const userProfilesData = user.profiles.map(profile => ({
					userId: createdUser.id,
					profileId: profile.id,
				}));

				await this.prismaService.userProfile.createMany({
					data: userProfilesData,
				});
			}

			return Result.Ok(createdUser);
		} catch (error) {
			return Result.InternalServer('Error creating user.');
		}
	}

	async findById(id: number): Promise<Result<UserWithPerson | null>> {
		if (!id) {
			return Result.BadRequest('Invalid user ID.');
		}

		const result = await this.execute<PrismaUserWithPerson | null>(() =>
			this.prismaService.user.findUnique({
				where: { id },
				include: {
					person: true,
					userProfiles: {
						include: {
							profile: {
								include: {
									permissions: {
										include: {
											permission: true,
										},
									},
								},
							},
						},
					},
				},
			}),
		);

		if (result.isFailure) {
			return result as Result<UserWithPerson | null>;
		}

		const prismaUser = result.getValue();
		if (!prismaUser) {
			return Result.Ok(null);
		}

		const userWithPerson = convertPrismaToUserWithPerson(prismaUser);
		return Result.Ok(userWithPerson);
	}

	async findByEmail(email: string): Promise<Result<UserWithPerson | null>> {
		const result = await this.execute<PrismaUserWithPerson | null>(() =>
			this.prismaService.user.findFirst({
				where: {
					person: {
						email,
					},
				},
				include: {
					person: true,
					userProfiles: {
						include: {
							profile: {
								include: {
									permissions: {
										include: {
											permission: true,
										},
									},
								},
							},
						},
					},
				},
			}),
		);

		if (result.isFailure) {
			return result as Result<UserWithPerson | null>;
		}

		const prismaUser = result.getValue();
		if (!prismaUser) {
			return Result.Ok(null);
		}

		const userWithPerson = convertPrismaToUserWithPerson(prismaUser);
		return Result.Ok(userWithPerson);
	}

	async findByDocumentNumber(documentNumber: string): Promise<Result<UserWithPerson | null>> {
		const result = await this.execute<PrismaUserWithPerson | null>(() =>
			this.prismaService.user.findFirst({
				where: {
					person: {
						documentNumber,
					},
				},
				include: {
					person: true,
					userProfiles: {
						include: {
							profile: {
								include: {
									permissions: {
										include: {
											permission: true,
										},
									},
								},
							},
						},
					},
				},
			}),
		);

		if (result.isFailure) {
			return result as Result<UserWithPerson | null>;
		}

		const prismaUser = result.getValue();
		if (!prismaUser) {
			return Result.Ok(null);
		}

		const userWithPerson = convertPrismaToUserWithPerson(prismaUser);
		return Result.Ok(userWithPerson);
	}

	async update(id: number, user: UserModel): Promise<Result<UserWithPerson | null>> {
		const prisma = this.prismaService;

		try {
			const personId = user.person.id;

			if (!personId) {
				return Result.Fail('Person ID not found for the user.');
			}

			await prisma.$transaction(async (tx) => {
				const updatedPerson = await tx.person.update({
					where: { id: personId },
					data: {
						name: user.person.name,
						personType: PersonMapper.toPrismaPersonType(user.person.personType),
						documentNumber: user.person.documentNumber,
						birthDate: user.person.birthDate,
						status: PersonMapper.toPrismaStatus(user.person.status),
						email: user.person.email,
					},
				});

				await tx.user.update({
					where: { id: id },
					data: {
						hash: user.hash,
						personId: updatedPerson.id,
					},
				});

				if (user.profiles && user.profiles.length > 0) {
					await tx.userProfile.deleteMany({
						where: { userId: id },
					});

					const userProfilesData = user.profiles.map((profile) => ({
						userId: id,
						profileId: profile.id,
					}));

					await tx.userProfile.createMany({
						data: userProfilesData,
					});
				}
			});

			// Buscar o usuário atualizado com todos os relacionamentos
			const updatedUser = await this.findUserWithProfiles(id);
			if (!updatedUser) {
				return Result.NotFound('User not found after update.');
			}

			return Result.Ok(updatedUser);
		} catch (error) {
			console.error('Error updating user:', error);
			return Result.Fail('Error updating user.');
		}
	}

	async delete(id: number): Promise<Result<void>> {
		try {
			await this.prismaService.user.delete({
				where: { id },
			});
			return Result.Ok(undefined);
		} catch (error) {
			return Result.Fail('Error deleting user');
		}
	}

	async findUserWithProfiles(userId: number): Promise<UserWithPerson | null> {
		const prismaUser = await this.prismaService.user.findUnique({
			where: { id: userId },
			include: {
				person: true,
				userProfiles: {
					include: {
						profile: {
							include: {
								permissions: {
									include: {
										permission: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!prismaUser) {
			return null;
		}

		return convertPrismaToUserWithPerson(prismaUser);
	}
}
