import { PersonType } from '../enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';

export class PersonModel {
    constructor(
        public name: string,
        public personType: PersonType,
        public documentNumber: string,
        public birthDate: Date | null,
        public status: Status = Status.Active,
        public email?: string | null,
        public id?: number,
    ) { }
}