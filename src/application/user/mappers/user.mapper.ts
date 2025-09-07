import { UserWithPerson } from "@domain/user/types/userPerson.type";
import { UserModel } from '@domain/user/models/user.model';

export class UserMapper {
	static fromPrisma(user: UserWithPerson): UserModel {
		return new UserModel(user.person, user.hash);
	}
}