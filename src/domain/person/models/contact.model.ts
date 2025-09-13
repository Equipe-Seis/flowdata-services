import { ContactType } from '@domain/person/enums/contact-type.enum';
import { LinkType } from '@domain/person/enums/link-type.enum';

export class ContactModel {
    constructor(
        public type: ContactType,
        public value: string,
        public linkType: LinkType,
        public primary: boolean = false,
        public note?: string,
        public id?: number,
    ) { }
}