//src\application\services\shared\person\person.service.ts
import { Injectable } from '@nestjs/common';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';
import { CreatePersonDto } from '@application/dto/shared/person/create-person.dto';
import { Result } from '@domain/shared/result/result.pattern';  // <-- IMPORTANDO Result
import { Person } from '@domain/shared/person/person.entity';
import { Status, PersonType } from '@prisma/client';

@Injectable()
export class PersonService {
    constructor(private readonly personRepository: IPersonRepository) { }

    async createPerson(dto: CreatePersonDto): Promise<Result<Person>> {
        // Validações, lógicas de negócio, etc.

        const personData = {
            ...dto,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        };

        const createdPerson = await this.personRepository.create(personData);

        // Retorna um resultado com a pessoa criada
        return Result.Ok(createdPerson);
    }

    async getPersonById(id: number): Promise<Result<Person>> {
        const person = await this.personRepository.findById(id);

        if (!person) {
            return Result.NotFound('Person not found');
        }

        return Result.Ok(person);
    }
}

