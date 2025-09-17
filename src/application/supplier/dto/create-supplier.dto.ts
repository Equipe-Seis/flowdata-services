import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsDateString,
    ValidateNested,
    IsArray,
    ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePersonDto } from '@application/person/dto/create-person.dto';
import { CreateContactDto } from '@application/person/dto/create-contact.dto';
import { CreateAddressDto } from '@application/person/dto/create-address.dto';

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

    @ApiProperty({
        type: [CreateContactDto],
        required: false,
        description: 'Optional list of contacts for the supplier',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateContactDto)
    contacts?: CreateContactDto[];

    @ApiProperty({
        type: [CreateAddressDto],
        required: false,
        description: 'Optional list of addresses for the supplier',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAddressDto)
    addresses?: CreateAddressDto[];
}
