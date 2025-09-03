import {
    IsOptional,
    IsString,
    MinLength,
    IsDateString,
    IsEnum,
    IsEmail,
    Length,
} from 'class-validator';
import { Status, PersonType } from '@prisma/client';

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @MinLength(6)
    hash?: string;


    @IsString()
    @Length(1, 100)
    name?: string;

    @IsEnum(PersonType)
    personType?: PersonType;

    @IsString()
    @Length(1, 20)
    documentNumber?: string;

    @IsDateString()
    birthDate?: string;

    @IsEnum(Status)
    status?: Status;

    //@IsOptional()
    @IsEmail()
    email?: string;
}
