import { Injectable } from '@nestjs/common';
import type { CreatePersonDto } from '@application/dto/shared/person/create-person.dto';
import type { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';

@Injectable()
export class PersonService {
    constructor(private readonly personRepository: IPersonRepository) { }

    async createPerson(dto: CreatePersonDto) {
        const personData = {
            ...dto,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        };

        return this.personRepository.create(personData);
    }

    async getAllPersons() {
        return this.personRepository.findAll();
    }

    async getPersonById(id: number) {
        return this.personRepository.findById(id);
    }


}
