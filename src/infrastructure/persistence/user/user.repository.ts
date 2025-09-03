// src/infrastructure/persistence/repository/user.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '@domain/user/user.model';
import { Result } from '@domain/shared/result/result.pattern';
import { AppError } from '@domain/shared/result/result.pattern';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { Person, User } from '@prisma/client';
import { UserWithPerson } from '@domain/user/types/userPerson.type';

// TODO: full refactor
@Injectable()
export class UserRepository
	extends PrismaRepository
	implements IUserRepository
{
	constructor(
		@Inject(IPersonRepository)
		private readonly personRepository: IPersonRepository,
		protected prismaService: PrismaService,
	) {
		super(prismaService);
	}

	async create(user: UserModel): Promise<Result<User>> {
		try {
			// TODO: this should be in the service
			const existingPersonResult =
				await this.personRepository.findByDocumentNumber(
					user.person.documentNumber,
				);

			if (existingPersonResult.isSuccess && existingPersonResult.getValue()) {
				const existingPerson = existingPersonResult.getValue()!;

				const createdUser = await this.prismaService.user.create({
					data: {
						personId: existingPerson.id,
						hash: user.hash,
					},
				});

				return Result.Ok(createdUser);
			}

			const createdPersonResult = await this.personRepository.create({
				name: user.person.name,
				documentNumber: user.person.documentNumber,
				birthDate: user.person.birthDate,
				personType: user.person.personType,
				status: user.person.status,
				email: user.person.email,
			});

			if (createdPersonResult.isFailure) {
				return Result.Fail(createdPersonResult.getError());
			}

			const createdPerson = createdPersonResult.getValue();

			const createdUser = await this.prismaService.user.create({
				data: {
					personId: createdPerson.id,
					hash: user.hash,
				},
			});

			return Result.Ok(createdUser);
		} catch (error) {
			return Result.Fail(AppError.InternalServer('Error creating user.'));
		}
	}

	async findById(id: number): Promise<Result<UserWithPerson>> {
		try {
			const foundUser = await this.prismaService.user.findUnique({
				where: { id },
				include: { person: true },
			});

			if (!foundUser) {
				return Result.Fail('User not found');
			}

			return Result.Ok(foundUser);
		} catch (error) {
			return Result.Fail('Error finding user by ID');
		}
	}

	async findByEmail(email: string): Promise<Result<UserWithPerson>> {
		try {
			const foundUser = await this.prismaService.user.findFirst({
				where: {
					person: {
						email,
					},
				},
				include: { person: true },
			});

			if (!foundUser) {
				return Result.Fail('User not found');
			}

			return Result.Ok(foundUser);
		} catch (error) {
			return Result.Fail('Error finding user by email');
		}
	}

	async update(id: number, user: UserModel): Promise<Result<User>> {
		const prisma = this.prismaService;

		try {
			const existingPerson = await prisma.person.findUnique({
				where: { id },
			});

			if (!existingPerson) {
				return Result.Fail('Pessoa associada ao usuário não encontrada.');
			}

			const updatedUser = await prisma.$transaction(async (tx) => {
				const updatedPerson = await tx.person.update({
					where: { id: id },
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
						personId: updatedPerson.id,
						hash: user.hash,
					},
				});

				return updatedUser;
			});

			return Result.Ok(updatedUser);
		} catch (error) {
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
}
