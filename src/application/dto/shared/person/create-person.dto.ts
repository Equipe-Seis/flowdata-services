
//src\application\dto\shared\person\create-person.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsEmail } from 'class-validator';
import { Status, PersonType } from '@prisma/client';

export class CreatePersonDto {
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
    @IsOptional()
    @IsEmail()
    email?: string;
}
