import { PersonModel } from '@domain/person/models/person.model';
import { Result } from '@domain/shared/result/result.pattern';
import { Person } from '@prisma/client';

export interface IPersonRepository {
	create(data: PersonModel): Promise<Result<Person>>;
	findAll(): Promise<Result<Person[]>>;
	findById(id: number): Promise<Result<Person | null>>;
	findByDocumentNumber(documentNumber: string): Promise<Result<Person | null>>;
	findByEmail(email: string): Promise<Result<Person | null>>;
}

export const IPersonRepository = Symbol('IPersonRepository');
