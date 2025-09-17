import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsEmail, IsNumber } from 'class-validator';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';

export class UpdatePersonDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'individual' })
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
