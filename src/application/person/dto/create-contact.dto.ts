import { ApiProperty } from '@nestjs/swagger';
import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateContactDto {
    @ApiProperty({ enum: ContactType })
    @IsEnum(ContactType)
    type: ContactType;

    @ApiProperty()
    @IsString()
    value: string;

    @ApiProperty({ enum: LinkType })
    @IsEnum(LinkType)
    linkType: LinkType;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    primary?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}
