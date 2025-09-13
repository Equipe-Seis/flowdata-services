import { Injectable } from '@nestjs/common';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Person } from '@prisma/client';
import { PersonModel } from '@domain/person/models/person.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';

function convertPersonToModel(person: Person): PersonModel {
	return new PersonModel(
		person.name,
		PersonMapper.toDomainPersonType(person.personType),
		person.documentNumber,
		person.birthDate,
		PersonMapper.toDomainStatus(person.status),
		person.email,
		person.id,
	);
}

function convertResultToPersonModel(result: Result<Person>): Result<PersonModel> {
	if (result.isFailure) {
		return result as Result<PersonModel>;
	}
	const person = result.getValue()!;
	const personModel = convertPersonToModel(person);
	return Result.Ok(personModel);
}

function convertResultToPersonModelArray(result: Result<Person[]>): Result<PersonModel[]> {
	if (result.isFailure) {
		return result as Result<PersonModel[]>;
	}
	const persons = result.getValue()!;
	const personModels = persons.map(convertPersonToModel);
	return Result.Ok(personModels);
}

function convertResultToPersonModelOrNull(result: Result<Person | null>): Result<PersonModel | null> {
	if (result.isFailure) {
		return result as Result<PersonModel | null>;
	}
	const person = result.getValue();
	if (!person) {
		return Result.Ok(null);
	}
	const personModel = convertPersonToModel(person);
	return Result.Ok(personModel);
}

@Injectable()
export class PersonRepository
	extends PrismaRepository
	implements IPersonRepository {
	async create(data: PersonModel): Promise<Result<PersonModel>> {
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

		const result = await this.execute<Person>(() =>
			this.prismaService.person.create({
				data: {
					name: data.name,
					personType: PersonMapper.toPrismaPersonType(data.personType),
					documentNumber: data.documentNumber,
					birthDate: data.birthDate,
					status: PersonMapper.toPrismaStatus(data.status),
					email: data.email,
				},
			}),
		);

		return convertResultToPersonModel(result);
	}

	async findAll(): Promise<Result<PersonModel[]>> {
		const result = await this.execute<Person[]>(() => this.prismaService.person.findMany());
		return convertResultToPersonModelArray(result);
	}

	async findById(id: number): Promise<Result<PersonModel | null>> {
		const result = await this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { id },
			}),
		);

		return convertResultToPersonModelOrNull(result);
	}

	async findByDocumentNumber(
		documentNumber: string,
	): Promise<Result<PersonModel | null>> {
		const result = await this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { documentNumber },
			}),
		);

		return convertResultToPersonModelOrNull(result);
	}

	async findByEmail(email: string): Promise<Result<PersonModel | null>> {
		const result = await this.execute<Person | null>(() =>
			this.prismaService.person.findUnique({
				where: { email },
			}),
		);

		return convertResultToPersonModelOrNull(result);
	}
}
