import { PersonModel } from '@domain/person/models/person.model';
import { Result } from '@domain/shared/result/result.pattern';
import { Person } from '@prisma/client';
import { AddressModel } from '@domain/person/models/address.model';
import { ContactModel } from '@domain/person/models/contact.model';

export interface IPersonRepository {
	create(data: PersonModel): Promise<Result<PersonModel>>;
	findAll(): Promise<Result<PersonModel[]>>;
	findById(id: number): Promise<Result<PersonModel | null>>;
	findByDocumentNumber(documentNumber: string): Promise<Result<PersonModel | null>>;
	findByEmail(email: string): Promise<Result<PersonModel | null>>;
	createAddress(
		personId: number,
		address: AddressModel,
		linkType?: 'supplier' | 'customer' | 'person',
	): Promise<Result<AddressModel>>;

	createContact(
		personId: number,
		contact: ContactModel,
		linkType?: 'supplier' | 'customer' | 'person',
	): Promise<Result<ContactModel>>;

	deleteAddresses(personId: number): Promise<Result<void>>;
	deleteContacts(personId: number): Promise<Result<void>>;
}

export const IPersonRepository = Symbol('IPersonRepository');
