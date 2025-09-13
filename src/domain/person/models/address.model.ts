import { LinkType } from '@domain/person/enums/link-type.enum';

export class AddressModel {
    constructor(
        public street: string,
        public district: string,
        public city: string,
        public state: string,
        public postalCode: string,
        public linkType: LinkType,
        public id?: number,
    ) { }
}