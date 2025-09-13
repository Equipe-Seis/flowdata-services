import { Injectable } from '@nestjs/common';
import { IPersonRepository } from '@application/person/persistence/iperson.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Person, Address, Contact } from '@prisma/client';
import { PersonModel } from '@domain/person/models/person.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';
import { AddressMapper } from '@application/person/mappers/address.mapper';
import { ContactMapper } from '@application/person/mappers/contact.mapper';


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


	async deleteContacts(personId: number): Promise<Result<void>> {
		try {
			await this.prismaService.contact.deleteMany({
				where: { personId }
			});
			return Result.Ok(undefined);
		} catch (error) {
			return Result.Fail(
				error instanceof Error ? error.message : 'Failed to delete contacts.'
			);
		}
	}

	async deleteAddresses(personId: number): Promise<Result<void>> {
		try {
			await this.prismaService.address.deleteMany({
				where: { personId }
			});
			return Result.Ok(undefined);
		} catch (error) {
			return Result.Fail(
				error instanceof Error ? error.message : 'Failed to delete addresses.'
			);
		}
	}

	async createAddress(
		personId: number,
		address: AddressModel,
		linkType: 'supplier' | 'customer' | 'person' = 'person'
	): Promise<Result<AddressModel>> {
		try {
			const created = await this.prismaService.address.create({
				data: {
					personId,
					street: address.street,
					district: address.district,
					city: address.city,
					state: address.state,
					postalCode: address.postalCode,
					linkType,
				},
			});

			const mappedAddress = AddressMapper.fromPrisma(created);

			return Result.Ok(mappedAddress);
		} catch (error) {
			return Result.Fail(
				'Failed to create address: ' + (error instanceof Error ? error.message : 'Unknown error')
			);
		}
	}

	async createContact(
		personId: number,
		contact: ContactModel,
		linkType: 'supplier' | 'customer' | 'person' = 'person'
	): Promise<Result<ContactModel>> {
		try {
			const created = await this.prismaService.contact.create({
				data: {
					personId,
					primary: contact.primary ?? false,
					type: contact.type,
					value: contact.value,
					note: contact.note ?? undefined,
					linkType,
				},
			});

			const mappedContact = ContactMapper.fromPrisma(created);

			return Result.Ok(mappedContact);
		} catch (error) {
			return Result.Fail(
				'Failed to create contact: ' + (error instanceof Error ? error.message : 'Unknown error')
			);
		}
	}
}
