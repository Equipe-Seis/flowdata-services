import { Person } from '@domain/shared/person/person.entity';
import { PersonType, Status } from '@prisma/client';

export class Supplier extends Person {
    constructor(
        id: number,
        name: string,
        personType: PersonType,
        documentNumber: string,
        birthDate: Date | null,
        status: Status,
        email: string | null,

        public tradeName?: string,
        public openingDate?: Date,
        public type?: string,
        public size?: string,
        public legalNature?: string,
    ) {
        super(id, name, personType, documentNumber, birthDate, status, email);
    }
}