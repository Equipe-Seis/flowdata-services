
import { Injectable } from '@nestjs/common';
import { UserModel } from '@domain/user/models/user.model';
import { Result } from '@domain/shared/result/result.pattern';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { User } from '@prisma/client';
import { UserWithPerson } from '@domain/user/types/userPerson.type';

@Injectable()
export class UserRepository
	extends PrismaRepository
	implements IUserRepository {
	async create(user: UserModel, personId: number): Promise<Result<User>> {
		try {
			const createdUser = await this.prismaService.user.create({
				data: {
					personId: personId,
					hash: user.hash,
				},
			});

			if (user.profiles && user.profiles.length > 0) {
				const userProfilesData = user.profiles.map((profileId) => ({
					userId: createdUser.id,
					profileId,
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

		return this.execute<UserWithPerson | null>(() =>
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
	}

	async findByEmail(email: string): Promise<Result<UserWithPerson | null>> {
		return this.execute<UserWithPerson | null>(() =>
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
	}

	async findByDocumentNumber(email: string): Promise<Result<UserWithPerson | null>> {
		return this.execute<UserWithPerson | null>(() =>
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
	}

	async update(id: number, user: UserModel): Promise<Result<User>> {
		const prisma = this.prismaService;

		try {
			const personId = user.person.id;

			if (!personId) {
				return Result.Fail('Person ID not found for the user.');
			}

			const updatedUser = await prisma.$transaction(async (tx) => {
				const updatedPerson = await tx.person.update({
					where: { id: personId },
					data: {
						name: user.person.name,
						personType: user.person.personType,
						documentNumber: user.person.documentNumber,
						birthDate: user.person.birthDate,
						status: user.person.status,
						email: user.person.email,
					},
				});

				const updatedUser = await tx.user.update({
					where: { id: id },
					data: {
						hash: user.hash,
						personId: updatedPerson.id,
					},
				});

				// Update profiles: delete old and insert new
				if (user.profiles && user.profiles.length > 0) {
					// Delete all current profiles
					await tx.userProfile.deleteMany({
						where: { userId: id },
					});

					// Insert new profiles
					const userProfilesData = user.profiles.map((profileId) => ({
						userId: id,
						profileId,
					}));

					await tx.userProfile.createMany({
						data: userProfilesData,
					});
				}

				return updatedUser;
			});

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
		return this.prismaService.user.findUnique({
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
	}
}
