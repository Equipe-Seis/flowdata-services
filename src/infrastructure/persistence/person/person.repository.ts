import { Injectable } from '@nestjs/common';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Person } from '@prisma/client';
import { PersonModel } from '@domain/person/models/person.model';

@Injectable()
export class PersonRepository
	extends PrismaRepository
	implements IPersonRepository {
	async create(data: PersonModel): Promise<Result<Person>> {
		const existingPerson = await this.prismaService.person.findFirst({
			where: {
				OR: [{ documentNumber: data.documentNumber }, { email: data.email }],
			},
		});

		if (existingPerson) {
			return Result.Forbidden(
				'Person associated with user not found.',
			);
		}

		return this.execute<Person>(() =>
			this.prismaService.person.create({
				data: {
					...data,
				},
			}),
		);
	}

	async findAll(): Promise<Result<Person[]>> {
		return this.execute<Person[]>(() => this.prismaService.person.findMany());
	}

	async findById(id: number): Promise<Result<Person | null>> {
		return this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { id },
			}),
		);
	}

	async findByDocumentNumber(
		documentNumber: string,
	): Promise<Result<Person | null>> {
		return this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { documentNumber },
			}),
		);
	}

	async findByEmail(email: string): Promise<Result<Person | null>> {
		return this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { email },
			}),
		);
	}
}
