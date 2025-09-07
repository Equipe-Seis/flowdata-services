import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PersonService } from '@application/person/services/person.service';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';

@Controller('persons')
export class PersonController {
	constructor(private readonly personService: PersonService) {}

	@Post()
	async create(@Body() dto: CreatePersonDto) {
		const result = await this.personService.createPerson(dto);
		return result.mapToPresentationResult();
	}

	@Get(':id')
	async findById(@Param('id') id: string) {
		const result = await this.personService.getPersonById(+id);
		return result.mapToPresentationResult();
	}
}
