import { SupplierWithPerson } from "@domain/supplier/types/supplierPerson.type";
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { PersonModel } from '@domain/person/models/person.model';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';
import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class SupplierMapper {

    static fromDto(dto: CreateSupplierDto, person: PersonModel): SupplierModel {
        const contacts: ContactModel[] = (dto.contacts || []).map((contactDto) =>
            new ContactModel(
                contactDto.type as ContactType,
                contactDto.value,
                contactDto.linkType as LinkType,
                contactDto.primary ?? false,
                contactDto.note,
            ),
        );

        const addresses: AddressModel[] = (dto.addresses || []).map((addressDto) =>
            new AddressModel(
                addressDto.street,
                addressDto.district,
                addressDto.city,
                addressDto.state,
                addressDto.postalCode,
                addressDto.linkType as LinkType,
            ),
        );

        return SupplierModel.create(
            person,
            dto.tradeName,
            dto.openingDate ? new Date(dto.openingDate) : undefined,
            dto.type,
            dto.size,
            dto.legalNature,
            contacts,
            addresses,
        );
    }


    static toDomain(supplier: SupplierWithPerson): SupplierModel {
        return new SupplierModel(
            supplier.person,
            supplier.tradeName,
            supplier.openingDate,
            supplier.type,
            supplier.size,
            supplier.legalNature,
            supplier.contacts ?? [],
            supplier.addresses ?? [],
            supplier.id
        );
    }
}
