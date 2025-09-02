// src/infrastructure/persistence/repository/shared/person/person.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';
import { Person } from '@domain/shared/person/person.entity';
import { PersonMapper } from '@infrastructure/persistence/repository/shared/person/person.mapper';

@Injectable()
export class PersonRepository implements IPersonRepository {
    constructor(private readonly prisma: PrismaService) { }

    // Método para criar uma nova pessoa
    async create(data: Partial<Person>): Promise<Person> {
        // Verificar se já existe uma pessoa com o mesmo documento ou email
        const existingPerson = await this.prisma.person.findFirst({
            where: {
                OR: [
                    { documentNumber: data.documentNumber },
                    { email: data.email }
                ]
            }
        });

        // Caso exista, lançar um erro informando
        if (existingPerson) {
            throw new Error('Pessoa com esse número de documento ou email já existe.');
        }

        // Mapper de dados para o formato do Prisma
        const createInput = PersonMapper.toPrismaCreateInput(data);
        const createdPerson = await this.prisma.person.create({ data: createInput });

        // Retornar a nova pessoa
        return new Person(
            createdPerson.id,
            createdPerson.name,
            createdPerson.personType,
            createdPerson.documentNumber,
            createdPerson.birthDate,
            createdPerson.status,
            createdPerson.email
        );
    }

    // Buscar todas as pessoas
    async findAll(): Promise<Person[]> {
        const result = await this.prisma.person.findMany();
        return result.map(
            (p) => new Person(p.id, p.name, p.personType, p.documentNumber, p.birthDate, p.status, p.email)
        );
    }

    // Buscar pessoa por ID
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
            found.email
        );
    }

    // Buscar pessoa por número de documento
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
            found.email
        );
    }

    // Buscar pessoa por email
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
            found.email
        );
    }
}
