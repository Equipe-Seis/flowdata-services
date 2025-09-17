import { ProfileModel } from '@domain/profile/models/profile.model';
import { Result } from '@domain/shared/result/result.pattern';
import { ContactModel } from '@domain/person/models/contact.model';
import { AddressModel } from '@domain/person/models/address.model';

export abstract class IProfileRepository {
    abstract findAll(): Promise<ProfileModel[]>;
    abstract findPermissionsByProfileId(profileId: number): Promise<string[]>;
    abstract countByIds(profileIds: number[]): Promise<number>;

}