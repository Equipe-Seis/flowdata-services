import { Person } from '@domain/shared/person/person.entity';
import { Prisma, Person as PrismaPerson } from '@prisma/client';

export class PersonMapper {
    static toPrismaCreateInput(entity: Partial<Person>): Prisma.PersonCreateInput {
        return {
            name: entity.name!,
            personType: entity.personType!,
            documentNumber: entity.documentNumber!,
            birthDate: entity.birthDate ?? null,
            status: entity.status ?? 'ACTIVE',
            email: entity.email ?? null,
        };
    }

    static toDomain(prismaModel: PrismaPerson): Person {
        return new Person(
            prismaModel.id,
            prismaModel.name,
            prismaModel.personType,
            prismaModel.documentNumber,
            prismaModel.birthDate ?? null,
            prismaModel.status,
            prismaModel.email ?? null
        );
    }
}
