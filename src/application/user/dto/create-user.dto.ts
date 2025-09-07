import { ApiProperty } from '@nestjs/swagger';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateUserDto {

    @ApiProperty({ type: () => CreatePersonDto })
    @ValidateNested()
    @Type(() => CreatePersonDto)
    person: CreatePersonDto;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}
