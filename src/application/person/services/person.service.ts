import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { Result } from '@domain/shared/result/result.pattern'; 
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { Person } from '@prisma/client';
import { PersonModel } from '@domain/person/person.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';

@Injectable()
export class PersonService {
	constructor(private readonly personRepository: IPersonRepository) {}

	async createPerson(dto: CreatePersonDto): Promise<Result<PersonModel>> {
		const data = PersonMapper.fromDto(dto);

		const result = await this.personRepository.create(data);

		if (result.isFailure) {
			return Result.Fail(result.getError());
		}

		return Result.Ok(PersonMapper.fromPrisma(result.getValue()));
	}

	async getPersonById(id: number): Promise<Result<Person | null>> {
		return await this.personRepository.findById(id);
	}
}
