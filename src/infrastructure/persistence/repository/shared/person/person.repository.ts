//src\infrastructure\persistence\repository\shared\person\person.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';
import { Person } from '@domain/shared/person/person.entity';
import { PersonMapper } from '@infrastructure/persistence/repository/shared/person/person.mapper';

@Injectable()
export class PersonRepository implements IPersonRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Partial<Person>): Promise<Person> {
        const createInput = PersonMapper.toPrismaCreateInput(data);
        const created = await this.prisma.person.create({ data: createInput });
        return new Person(
            created.id,
            created.name,
            created.personType,
            created.documentNumber,
            created.birthDate,
            created.status,
            created.email,
        );
    }

    async findAll(): Promise<Person[]> {
        const result = await this.prisma.person.findMany();
        return result.map(
            (p) =>
                new Person(p.id, p.name, p.personType, p.documentNumber, p.birthDate, p.status, p.email),
        );
    }

    async findById(id: number): Promise<Person | null> {
        const found = await this.prisma.person.findUnique({ where: { id } });
        if (!found) return null;
        return new Person(
            found.id,
            found.name,
            found.personType,
            found.documentNumber,
            found.birthDate,
            found.status,
            found.email,
        );
    }

    async findByDocumentNumber(documentNumber: string): Promise<Person | null> {
        const found = await this.prisma.person.findUnique({
            where: { documentNumber },
        });

        if (!found) return null;

        return new Person(
            found.id,
            found.name,
            found.personType,
            found.documentNumber,
            found.birthDate,
            found.status,
            found.email,
        );
    }

    async findByEmail(email: string): Promise<Person | null> {
        const found = await this.prisma.person.findUnique({
            where: { email },
        });

        if (!found) return null;

        return new Person(
            found.id,
            found.name,
            found.personType,
            found.documentNumber,
            found.birthDate,
            found.status,
            found.email,
        );
    }


}
