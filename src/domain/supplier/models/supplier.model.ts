import { PersonModel } from '@domain/person/models/person.model';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';

export class SupplierModel {
	constructor(
		public person: PersonModel,
		public tradeName?: string,
		public openingDate?: Date,
		public type?: string,
		public size?: string,
		public legalNature?: string,

		public contacts: ContactModel[] = [],
		public addresses: AddressModel[] = [],

		public id?: number,
	) {
		if (!contacts || contacts.length === 0) {
			throw new Error('Supplier must have at least one contact.');
		}

		if (!addresses || addresses.length === 0) {
			throw new Error('Supplier must have at least one address.');
		}
	}

	static create(
		person: PersonModel,
		tradeName: string | undefined,
		openingDate: Date | undefined,
		type: string | undefined,
		size: string | undefined,
		legalNature: string | undefined,
		contacts: ContactModel[],
		addresses: AddressModel[],
		id?: number,
	): SupplierModel {
		if (!contacts || contacts.length === 0) {
			throw new Error('Supplier must have at least one contact.');
		}

		if (!addresses || addresses.length === 0) {
			throw new Error('Supplier must have at least one address.');
		}

		return new SupplierModel(
			person,
			tradeName,
			openingDate,
			type,
			size,
			legalNature,
			contacts,
			addresses,
			id,
		);
	}
}
