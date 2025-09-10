import { Profile } from '@domain/profile/models/profile.model';

export abstract class IProfileRepository {
    abstract findAll(): Promise<Profile[]>;
    abstract findPermissionsByProfileId(profileId: number): Promise<string[]>;
    abstract countByIds(profileIds: number[]): Promise<number>;
}