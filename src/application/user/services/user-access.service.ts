import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { UserMapper } from '@application/user/mappers/user.mapper';

@Injectable()
export class UserAccessService {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        @Inject(IUserCache) private readonly userCache: IUserCache,
    ) { }

    async updateUserPermissionsCache(userId: number): Promise<void> {
        const userWithProfiles = await this.userRepository.findUserWithProfiles(userId);
        await this.userCache.clearUserCache(userId);

        if (!userWithProfiles) return;

        const user = UserMapper.toDomain(userWithProfiles);

        const permissions = user.getPermissions();
        const profiles = user.getProfileNames();

        await this.userCache.cachePermissions(userId, permissions);
        await this.userCache.cacheProfiles(userId, profiles);
    }
}