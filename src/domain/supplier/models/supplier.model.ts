import { PersonModel } from '@domain/person/models/person.model';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';

export class SupplierModel extends PersonModel {
	constructor(
		name: string,
		personType: PersonType,
		documentNumber: string,
		birthDate: Date | null,
		status: Status,
		email?: string,

		public tradeName?: string,
		public openingDate?: Date,
		public type?: string,
		public size?: string,
		public legalNature?: string,
	) {
		super(name, personType, documentNumber, birthDate, status, email);
	}
}
