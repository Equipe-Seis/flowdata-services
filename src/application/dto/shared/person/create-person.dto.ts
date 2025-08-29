import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsEmail } from 'class-validator';
import { Status, PersonType } from '@prisma/client';

export class CreatePersonDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(PersonType)
    personType: PersonType;

    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @IsOptional()
    @IsEmail()
    email?: string;
}
