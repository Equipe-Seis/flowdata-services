import { PersonModel } from '@domain/person/models/person.model';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';

export interface SupplierWithPerson {
	id: number;
	tradeName: string | undefined;
	openingDate: Date | undefined;
	type: string | undefined;
	size: string | undefined;
	legalNature: string | undefined;
	person: PersonModel;

	contacts: ContactModel[];
	addresses: AddressModel[];
}
