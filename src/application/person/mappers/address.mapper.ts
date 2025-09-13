import { AddressModel } from '@domain/person/models/address.model';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class AddressMapper {
    static fromDto(dto: any): AddressModel {
        return new AddressModel(
            dto.street,
            dto.district,
            dto.city,
            dto.state,
            dto.postalCode,
            dto.linkType as LinkType,
            dto.id,
        );
    }
}
