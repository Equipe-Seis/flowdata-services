import { PersonModel } from '@domain/person/models/person.model';

export class UserModel {
	constructor(
		public person: PersonModel,
		public hash: string,
		public profiles: number[] = [],
		public id?: number,
	) { }
}
