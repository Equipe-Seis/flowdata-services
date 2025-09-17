import { PersonModel } from '@domain/person/models/person.model';

export interface UserProfile {
	id: number;
	name: string;
	description: string;
	permissions: {
		permission: {
			name: string;
		};
	}[];
}

export interface UserWithPerson {
	id: number;
	hash: string;
	person: PersonModel;
	userProfiles: {
		profile: UserProfile;
	}[];
}
