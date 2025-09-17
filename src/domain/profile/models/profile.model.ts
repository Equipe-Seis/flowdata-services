/*export class Profile {
    constructor(
        public id: number,
        public name: string,
        public description: string,
    ) { }
}*/

export class ProfileModel {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public description: string,
        public readonly permissions: string[] = [],
    ) { }

    getPermissionNames(): string[] {
        return this.permissions;
    }
}