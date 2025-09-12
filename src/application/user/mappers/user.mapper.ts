import { UserWithPerson } from "@domain/user/types/userPerson.type";
import { UserModel } from '@domain/user/models/user.model';
import { PersonModel } from "@domain/person/models/person.model";
import { ProfileModel } from '@domain/profile/models/profile.model';

export class UserMapper {
	static toDomain(user: UserWithPerson): UserModel {
		const person = new PersonModel(
			user.person.name,
			user.person.personType,
			user.person.documentNumber,
			user.person.birthDate ?? null,
			user.person.status,
			user.person.email ?? null,
			user.person.id
		);

		const profiles = user.userProfiles.map(up => {
			const permissionNames = up.profile.permissions.map(p => p.permission.name);
			return new ProfileModel(up.profile.id, up.profile.name, up.profile.description, permissionNames);
		});

		return new UserModel(person, user.hash, profiles, user.id);
	}
}