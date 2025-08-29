import { ApiProperty } from '@nestjs/swagger';
import { CreatePersonDto } from '@application/dto/shared/person/create-person.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateUserDto {

    @ApiProperty({ type: () => CreatePersonDto })
    @ValidateNested()
    @Type(() => CreatePersonDto)
    person: CreatePersonDto;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    personType: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    documentNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    birthDate: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}
