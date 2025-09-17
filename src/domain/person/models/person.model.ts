import { PersonType } from '../enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';

export class PersonModel {
    id?: number;  // Opcional para criação, obrigatório após persistência
    name: string;
    personType: PersonType;
    documentNumber: string;
    birthDate: Date | null;
    status: Status;
    email: string | null;

    constructor(
        name: string,
        personType: PersonType,
        documentNumber: string,
        birthDate: Date | null,
        status: Status,
        email: string | null,
        id?: number
    ) {
        this.name = name;
        this.personType = personType;
        this.documentNumber = documentNumber;
        this.birthDate = birthDate;
        this.status = status;
        this.email = email;
        if (id !== undefined) this.id = id;
    }
}

