import { PersonModel } from '@domain/person/person.model';
import { PersonType, Status } from '@prisma/client';

export class Supplier extends PersonModel {
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
