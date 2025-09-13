import { PersonModel } from '@domain/person/models/person.model';
import { Result } from '@domain/shared/result/result.pattern';
import { Person } from '@prisma/client';

export interface IPersonRepository {
	create(data: PersonModel): Promise<Result<PersonModel>>;
	findAll(): Promise<Result<PersonModel[]>>;
	findById(id: number): Promise<Result<PersonModel | null>>;
	findByDocumentNumber(documentNumber: string): Promise<Result<PersonModel | null>>;
	findByEmail(email: string): Promise<Result<PersonModel | null>>;
}

export const IPersonRepository = Symbol('IPersonRepository');
