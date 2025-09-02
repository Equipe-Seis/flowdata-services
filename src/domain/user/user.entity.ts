// src/domain/user/user.entity.ts
import { Person } from '@domain/shared/person/person.entity';

export class User {
    constructor(
        public id: number,
        public person: Person,
        public hash: string,
    ) { }
}

