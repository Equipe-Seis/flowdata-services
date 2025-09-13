import {
    IsOptional,
    IsString,
    MinLength,
    IsDateString,
    IsEnum,
    IsEmail,
    Length,
    IsArray,
    ArrayNotEmpty,
    IsNumber
} from 'class-validator';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
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

    @IsArray({ message: 'Profiles must be an array of numeric IDs.' })
    @ArrayNotEmpty({ message: 'At least one profile must be provided.' })
    @IsNumber({}, { each: true, message: 'Each profile must be a number.' })
    profiles: number[];
}
