import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePersonDto } from '@application/person/dto/update-person.dto';
import { CreateContactDto } from '@application/person/dto/create-contact.dto';
import { CreateAddressDto } from '@application/person/dto/create-address.dto';

export class UpdateSupplierDto {
	@ValidateNested()
	@Type(() => UpdatePersonDto)
	person: UpdatePersonDto;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreateContactDto)
	contacts?: CreateContactDto[];

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreateAddressDto)
	addresses?: CreateAddressDto[];

	tradeName?: string;
	openingDate?: string;
	type?: string;
	size?: string;
	legalNature?: string;
}
