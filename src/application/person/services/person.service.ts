import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { Result } from '@domain/shared/result/result.pattern';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { PersonModel } from '@domain/person/models/person.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';

@Injectable()
export class PersonService {
	constructor(private readonly personRepository: IPersonRepository) { }

	async createPerson(dto: CreatePersonDto): Promise<Result<PersonModel>> {
		const data = PersonMapper.fromDto(dto);
		return await this.personRepository.create(data);
	}

	async getPersonById(id: number): Promise<Result<PersonModel | null>> {
		return await this.personRepository.findById(id);
	}
}
