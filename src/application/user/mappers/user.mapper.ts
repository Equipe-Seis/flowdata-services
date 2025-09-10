import { UserWithPerson } from "@domain/user/types/userPerson.type";
import { UserModel } from '@domain/user/models/user.model';
import { PersonModel } from "@domain/person/models/person.model";

export class UserMapper {
	static fromPrisma(user: UserWithPerson): UserModel {
		const person = new PersonModel(
			user.person.name,
			user.person.personType,
			user.person.documentNumber,
			user.person.birthDate ?? null,
			user.person.status,
			user.person.email ?? null,
			user.person.id
		);

		const profileIds = user.userProfiles?.map(up => up.profileId) || [];

		return new UserModel(person, user.hash, profileIds, user.id);
	}
}