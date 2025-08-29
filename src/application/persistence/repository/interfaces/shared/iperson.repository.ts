//src\application\persistence\repository\interfaces\shared\iperson.repository.ts
import { Person } from '@domain/shared/person/person.entity';

export interface IPersonRepository {
    create(data: Partial<Person>): Promise<Person>;
    findAll(): Promise<Person[]>;
    findById(id: number): Promise<Person | null>;
}
export const IPersonRepository = Symbol('IPersonRepository');