import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';

export class CreateSupplierDto {
    @ApiProperty({ type: () => CreatePersonDto })
    @ValidateNested()
    @Type(() => CreatePersonDto)
    person: CreatePersonDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tradeName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    openingDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    size?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    legalNature?: string;
}