import { PersonModel } from '@domain/person/person.model';

export class UserModel {
	constructor(
		public person: PersonModel,
		public hash: string,
	) {}
}
