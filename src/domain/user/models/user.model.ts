import { PersonModel } from '@domain/person/models/person.model';
import { ProfileModel } from '@domain/profile/models/profile.model';

export class UserModel {
	constructor(
		public person: PersonModel,
		public hash: string,
		public profiles: ProfileModel[] = [],
		public readonly id?: number,
	) { }

	getPermissions(): string[] {
		return this.profiles.flatMap(profile => profile.getPermissionNames());
	}

	getProfileNames(): string[] {
		return this.profiles.map(profile => profile.name);
	}
}