import { AddressModel } from '@domain/person/models/address.model';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class AddressMapper {
    static fromDto(dto: any): AddressModel {
        return new AddressModel(
            dto.id, // id
            dto.street,
            dto.district,
            dto.city,
            dto.state,
            dto.postalCode,
            dto.linkType as LinkType,
            dto.personId ?? 0, // personId - será definido posteriormente
        );
    }

    static fromPrisma(address: any): AddressModel {
        return new AddressModel(
            address.id,
            address.street,
            address.district,
            address.city,
            address.state,
            address.postalCode,
            address.linkType as LinkType,
            address.personId,
        );
    }
}

