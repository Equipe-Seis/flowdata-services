import { SupplierWithPerson } from "@domain/supplier/types/supplierPerson.type";
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@application/supplier/dto/update-supplier.dto';
import { PersonModel } from '@domain/person/models/person.model';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';
import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { ContactMapper } from '@application/person/mappers/contact.mapper';
import { AddressMapper } from '@application/person/mappers/address.mapper';

export class SupplierMapper {

    static fromDto(dto: CreateSupplierDto | UpdateSupplierDto, person: PersonModel): SupplierModel {
        const contacts: ContactModel[] = (dto.contacts || []).map((contactDto) =>
            new ContactModel(
                undefined, // id
                contactDto.type as ContactType,
                contactDto.value,
                contactDto.note ?? null,
                contactDto.primary ?? false,
                contactDto.linkType as LinkType,
                0, // personId - será definido posteriormente
            ),
        );

        const addresses: AddressModel[] = (dto.addresses || []).map((addressDto) =>
            new AddressModel(
                undefined, // id
                addressDto.street,
                addressDto.district,
                addressDto.city,
                addressDto.state,
                addressDto.postalCode,
                addressDto.linkType as LinkType,
                0, // personId - será definido posteriormente
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
        const person = PersonMapper.fromPrisma(supplier.person);
        const contacts = supplier.contacts.map(ContactMapper.fromPrisma);
        const addresses = supplier.addresses.map(AddressMapper.fromPrisma);

        return new SupplierModel(
            person,
            supplier.tradeName,
            supplier.openingDate,
            supplier.type,
            supplier.size,
            supplier.legalNature,
            contacts,
            addresses,
            supplier.id
        );
    }
}
