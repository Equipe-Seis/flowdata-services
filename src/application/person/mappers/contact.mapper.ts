import { ContactModel } from '@domain/person/models/contact.model';
import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class ContactMapper {
    static fromDto(dto: any): ContactModel {
        return new ContactModel(
            dto.type as ContactType,
            dto.value,
            dto.linkType as LinkType,
            dto.primary ?? false,
            dto.note,
            dto.id,
        );
    }
}
