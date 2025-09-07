import { Status, PersonType } from '@prisma/client';

export class PersonModel {
    constructor(
        public name: string,
        public personType: PersonType,
        public documentNumber: string,
        public birthDate: Date | null,
        public status: Status = Status.active,
        public email?: string | null,
    ) { }
}