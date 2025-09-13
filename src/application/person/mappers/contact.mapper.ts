import { ContactModel } from '@domain/person/models/contact.model';
import { CreateContactDto } from '@application/person/dto/create-contact.dto';
import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';
import { Contact } from '@prisma/client';

export class ContactMapper {

    static fromDto(dto: CreateContactDto): ContactModel {
        return new ContactModel(
            undefined, // id
            dto.type as ContactType,
            dto.value,
            dto.note ?? null,
            dto.primary ?? false,
            dto.linkType as LinkType,
            0, // personId - será definido posteriormente
        );
    }

    static fromPrisma(contact: Contact): ContactModel {
        return new ContactModel(
            contact.id,
            contact.type as ContactType,
            contact.value,
            contact.note ?? null,
            contact.primary,
            contact.linkType as LinkType,
            contact.personId
        );
    }
}
