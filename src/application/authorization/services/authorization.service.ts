
import {
    Inject,
    Injectable,
} from '@nestjs/common';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { UserMapper } from '@application/user/mappers/user.mapper';

@Injectable()
export class AuthorizationService {
    constructor(
        @Inject(IUserCache) private readonly userCache: IUserCache,
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    ) { }
    
    async profileAccessGranted(requiredProfiles: string[], userId: number) : Promise<boolean> {

        const cachedProfiles = await this.userCache.getProfiles(userId);

        if (!cachedProfiles) {
            const userWithProfiles = await this.userRepository.findUserWithProfiles(userId);

            await this.userCache.clearUserCache(userId);

            if (!userWithProfiles) return false;

            const user = UserMapper.toDomain(userWithProfiles);

            const profiles = user.getProfileNames();

            await this.userCache.cacheProfiles(userId, profiles);

            return requiredProfiles.some(profile => profiles?.includes(profile));
        }

        return requiredProfiles.some(profile => cachedProfiles?.includes(profile));
    } 

    async permissionAccessGranted(requiredPermissions: string[], userId: number): Promise<boolean> {

        const cachedPermissions = await this.userCache.getPermissions(userId);

        if (!cachedPermissions) {
            const userWithProfiles = await this.userRepository.findUserWithProfiles(userId);

            await this.userCache.clearUserCache(userId);

            if (!userWithProfiles) return false;

            const user = UserMapper.toDomain(userWithProfiles);
            const permissions = user.getPermissions();

            await this.userCache.cachePermissions(userId, permissions);

            return requiredPermissions.every(p => permissions.includes(p))
        }

        return requiredPermissions.every(p => cachedPermissions.includes(p));
    }
}