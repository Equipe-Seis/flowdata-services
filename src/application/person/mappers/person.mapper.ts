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
    // Mapeia PersonType do domínio para o Prisma
    static toPrismaPersonType(type: PersonType): PrismaPersonType {
        return type as unknown as PrismaPersonType;
    }

    // Mapeia PersonType do Prisma para o domínio
    static toDomainPersonType(type: PrismaPersonType): PersonType {
        return type as unknown as PersonType;
    }

    // Mapeia Status do domínio para o Prisma
    static toPrismaStatus(status: Status): PrismaStatus {
        return status as unknown as PrismaStatus;
    }

    // Mapeia Status do Prisma para o domínio
    static toDomainStatus(status: PrismaStatus): Status {
        return status as unknown as Status;
    }

    // Converte DTO para o modelo de domínio
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

    // Converte UpdatePersonDto para o modelo de domínio
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

    // Converte o objeto PrismaPerson para o modelo de domínio PersonModel
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

    // Converte o modelo de domínio PersonModel para o objeto PrismaPerson
    static toPrisma(personModel: PersonModel): PrismaPerson {
        return {
            id: personModel.id!,  // O ! é usado para indicar que o id nunca será null ou undefined
            name: personModel.name,
            personType: this.toPrismaPersonType(personModel.personType),
            documentNumber: personModel.documentNumber,
            birthDate: personModel.birthDate,
            status: this.toPrismaStatus(personModel.status),
            email: personModel.email,
        };
    }
}
