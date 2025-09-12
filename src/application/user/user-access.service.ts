//src\application\user\user-access.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IUserCache } from '@application/user/cache/iuser.cache';

@Injectable()
export class UserAccessService {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        @Inject(IUserCache) private readonly userCache: IUserCache,
    ) { }

    async updateUserPermissionsCache(userId: number): Promise<void> {
        const userWithProfiles = await this.userRepository.findUserWithProfiles(userId);
        console.log("----------------------IDDDDDDDD", userId);
        console.log("----------------------userWithProfiles", userWithProfiles);
        await this.userCache.clearUserCache(userId);

        if (!userWithProfiles) return;

        const permissions =
            userWithProfiles.userProfiles.flatMap(up =>
                up.profile.permissions.map(p => p.permission.name),
            ) ?? [];

        const profiles =
            userWithProfiles.userProfiles.map(up => up.profile.name) ?? [];

        console.log("----------------------permissions", permissions);
        console.log("----------------------profiles", profiles);

        await this.userCache.cachePermissions(userId, permissions);
        await this.userCache.cacheProfiles(userId, profiles);
    }
}