import {
    PersonType as PrismaPersonType,
    Status as PrismaStatus,
    Person as PrismaPerson,
} from '@prisma/client';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import { PersonModel } from '@domain/person/models/person.model';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';

export class PersonMapper {
    static toPrismaPersonType(type: PersonType): PrismaPersonType {
        return type as PrismaPersonType;
    }

    static toDomainPersonType(type: PrismaPersonType): PersonType {
        return type as PersonType;
    }

    static toPrismaStatus(status: Status): PrismaStatus {
        return status as PrismaStatus;
    }

    static toDomainStatus(status: PrismaStatus): Status {
        return status as Status;
    }

    static fromDto(dto: CreatePersonDto): PersonModel {
        return new PersonModel(
            dto.name,
            dto.personType,
            dto.documentNumber,
            dto.birthDate ? new Date(dto.birthDate) : null,
            dto.status || Status.Active,
            dto.email,
        );
    }

    static fromPrisma(person: PrismaPerson): PersonModel {
        return new PersonModel(
            person.name,
            this.toDomainPersonType(person.personType),
            person.documentNumber,
            person.birthDate,
            this.toDomainStatus(person.status),
            person.email,
            person.id,
        );
    }
}