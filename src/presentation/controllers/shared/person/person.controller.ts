import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PersonService } from '@application/services/shared/person/person.service';
import { CreatePersonDto } from '@application/dto/shared/person/create-person.dto';

@Controller('persons')
export class PersonController {
    constructor(private readonly personService: PersonService) { }

    @Post()
    async create(@Body() dto: CreatePersonDto) {
        return this.personService.createPerson(dto);
    }

    @Get()
    async findAll() {
        return this.personService.getAllPersons();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.personService.getPersonById(+id);
    }
}