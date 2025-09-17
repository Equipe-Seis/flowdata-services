import { ApiProperty } from '@nestjs/swagger';
import { LinkType } from '@domain/person/enums/link-type.enum';
import {
    IsString,
    IsEnum,
} from 'class-validator';

export class CreateAddressDto {
    @ApiProperty()
    @IsString()
    street: string;

    @ApiProperty()
    @IsString()
    district: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    state: string;

    @ApiProperty()
    @IsString()
    postalCode: string;

    @ApiProperty({ enum: LinkType })
    @IsEnum(LinkType)
    linkType: LinkType;
}
