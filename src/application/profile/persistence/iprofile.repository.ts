import { ProfileModel } from '@domain/profile/models/profile.model';

export abstract class IProfileRepository {
    abstract findAll(): Promise<ProfileModel[]>;
    abstract findPermissionsByProfileId(profileId: number): Promise<string[]>;
    abstract countByIds(profileIds: number[]): Promise<number>;
}