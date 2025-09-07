import { CreatePersonDto } from "@application/person/dto/create-person.dto";
import { PersonModel } from '@domain/person/models/person.model';
import { Person } from "@prisma/client";

export class PersonMapper {
    static fromDto(dto: CreatePersonDto): PersonModel {
        return new PersonModel(
            dto.name,
            dto.personType,
            dto.documentNumber,
            dto.birthDate ? new Date(dto.birthDate) : null,
            dto.status,
            dto.email,
        )
    }

    static fromPrisma(person: Person): PersonModel {
        return new PersonModel(
            person.name,
            person.personType,
            person.documentNumber,
            person.birthDate,
            person.status,
            person.email ?? undefined,
        )
    } 
}