//src\presentation\controllers\shared\person\person.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PersonService } from '@application/services/shared/person/person.service';
import { CreatePersonDto } from '@application/dto/shared/person/create-person.dto';

@Controller('persons')
export class PersonController {
    constructor(private readonly personService: PersonService) { }

    @Post()
    async create(@Body() dto: CreatePersonDto) {
        const result = await this.personService.createPerson(dto);
        if (result.isFailure) {
            // Trate erro, talvez lançando uma exceção HTTP personalizada
            throw new BadRequestException(result.error);
        }
        return result.value;
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const result = await this.personService.getPersonById(+id);
        if (result.isFailure) {
            // Trate erro, talvez lançando uma exceção HTTP personalizada
            throw new NotFoundException(result.error);
        }
        return result.value;
    }
}
