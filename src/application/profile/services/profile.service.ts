import { Injectable } from '@nestjs/common';
import { IProfileRepository } from '@application/profile/persistence/iprofile.repository';
import { ProfileResponseDto } from '@application/profile/dto/profile-response.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepo: IProfileRepository) { }

    async getAllProfiles(): Promise<ProfileResponseDto[]> {
        const profiles = await this.profileRepo.findAll();
        return profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            description: profile.description,
        }));
    }

    async getPermissions(profileId: number): Promise<string[]> {
        return await this.profileRepo.findPermissionsByProfileId(profileId);
    }
}