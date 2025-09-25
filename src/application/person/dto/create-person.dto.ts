import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsEmail } from 'class-validator';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';

export class CreatePersonDto {
    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'individual', enum: PersonType })
    @IsEnum(PersonType)
    personType: PersonType;

    @ApiProperty({ example: '12345678900' })
    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @ApiProperty({ example: '1990-01-01' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiProperty({ example: 'active' })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @ApiProperty({ example: 'joao@email.com' })
    @IsNotEmpty()
    @IsEmail()
    email?: string;
}
