import { LinkType } from '@domain/person/enums/link-type.enum';

export class AddressModel {
    constructor(
        public id: number | undefined,
        public street: string,
        public district: string,
        public city: string,
        public state: string,
        public postalCode: string,
        public linkType: LinkType,
        public personId: number  // Adicionando o campo personId
    ) { }
}
