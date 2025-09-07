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
	implements IUserRepository
{
	async create(user: UserModel, personId: number): Promise<Result<User>> {
		try {
			const createdUser = await this.prismaService.user.create({
				data: {
					personId: personId,
					hash: user.hash,
				},
			});

			return Result.Ok(createdUser);
		} catch (error) {
			return Result.InternalServer('Error creating user.');
		}
	}

	async findById(id: number): Promise<Result<UserWithPerson | null>> {
		return this.execute<UserWithPerson | null>(() =>
			this.prismaService.user.findUnique({
				where: { id },
				include: { person: true },
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
				include: { person: true },
			}),
		);
	}

	async update(id: number, user: UserModel): Promise<Result<User>> {
		const prisma = this.prismaService;

		try {
			const existingPerson = await this.prismaService.person.findUnique({
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
