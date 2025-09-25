import {
    PersonType as PrismaPersonType,
    Status as PrismaStatus,
    Person as PrismaPerson,
} from '@prisma/client';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import { PersonModel } from '@domain/person/models/person.model';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { UpdatePersonDto } from '@application/person/dto/update-person.dto';

export class PersonMapper {
    static toPrismaPersonType(type: PersonType): PrismaPersonType {
        switch (type) {
            case PersonType.Individual:
                return PrismaPersonType.individual;
            case PersonType.LegalEntity:
                return PrismaPersonType.legalentity;
            default:
                return PrismaPersonType.individual;
        }
    }

    static toDomainPersonType(type: PrismaPersonType): PersonType {
        switch (type) {
            case PrismaPersonType.individual:
                return PersonType.Individual;
            case PrismaPersonType.legalentity:
                return PersonType.LegalEntity;
            default:
                return PersonType.Individual;
        }
    }

    static toPrismaStatus(status: Status): PrismaStatus {
        switch (status) {
            case Status.Active:
                return PrismaStatus.active;
            case Status.Inactive:
                return PrismaStatus.inactive;
            case Status.Suspended:
                return PrismaStatus.inactive;
            default:
                return PrismaStatus.active;
        }
    }

    static toDomainStatus(status: PrismaStatus): Status {
        switch (status) {
            case PrismaStatus.active:
                return Status.Active;
            case PrismaStatus.inactive:
                return Status.Inactive;
            default:
                return Status.Active;
        }
    }

    static fromDto(dto: CreatePersonDto): PersonModel {
        return new PersonModel(
            dto.name,
            dto.personType,
            dto.documentNumber,
            dto.birthDate ? new Date(dto.birthDate) : null,
            dto.status || Status.Active,
            dto.email || null,
        );
    }

    static fromUpdateDto(dto: UpdatePersonDto): PersonModel {
        return new PersonModel(
            dto.name,
            dto.personType,
            dto.documentNumber,
            dto.birthDate ? new Date(dto.birthDate) : null,
            dto.status || Status.Active,
            dto.email || null,
            dto.id,
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

    static toPrisma(personModel: PersonModel): PrismaPerson {
        return {
            id: personModel.id!,
            name: personModel.name,
            personType: this.toPrismaPersonType(personModel.personType),
            documentNumber: personModel.documentNumber,
            birthDate: personModel.birthDate,
            status: this.toPrismaStatus(personModel.status),
            email: personModel.email,
        };
    }
}
