import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class ContactModel {
    constructor(
        public id: number | undefined,
        public type: ContactType,
        public value: string,
        public note: string | null,
        public primary: boolean,
        public linkType: LinkType,
        public personId: number  // Adicionando o campo personId
    ) { }
}
