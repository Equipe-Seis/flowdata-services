//src\domain\shared\person\person.entity.ts
import { Status, PersonType } from '@prisma/client';

export class Person {
    constructor(
        public id: number,
        public name: string,
        public personType: PersonType,
        public documentNumber: string,
        public birthDate: Date | null,
        public status: Status,
        public email: string | null,
    ) { }
}