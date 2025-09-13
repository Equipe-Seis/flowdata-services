//src\infrastructure\cache\user.cache.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IUserCache } from '@application/user/cache/iuser.cache';

@Injectable()
export class UserCache implements IUserCache {
    private readonly PERMISSIONS_PREFIX = 'user_permissions:';
    private readonly PROFILES_PREFIX = 'user_profiles:';
    private readonly DEFAULT_TTL = 60 * 60;

    private readonly USERS_LIST_KEY = 'users_list';
    private readonly USERS_LIST_TTL = 60 * 5;

    constructor(private redis: RedisService) { }

    async setPermissions(userId: number, permissions: string[], ttlSeconds = this.DEFAULT_TTL): Promise<void> {
        const key = `${this.PERMISSIONS_PREFIX}${userId}`;
        await this.redis.set(key, permissions, ttlSeconds);
    }

    async getPermissions(userId: number): Promise<string[] | null> {
        const key = `${this.PERMISSIONS_PREFIX}${userId}`;
        return await this.redis.get<string[]>(key);
    }

    async setProfiles(userId: number, profiles: string[], ttlSeconds = this.DEFAULT_TTL): Promise<void> {
        const key = `${this.PROFILES_PREFIX}${userId}`;
        await this.redis.set(key, profiles, ttlSeconds);
    }

    async getProfiles(userId: number): Promise<string[] | null> {
        const key = `${this.PROFILES_PREFIX}${userId}`;
        return await this.redis.get<string[]>(key);
    }

    async clear(userId: number): Promise<void> {
        await this.redis.del(`${this.PERMISSIONS_PREFIX}${userId}`);
        await this.redis.del(`${this.PROFILES_PREFIX}${userId}`);
    }

    async clearUserCache(userId: number): Promise<void> {
        await this.redis.clearUserCache(userId);
    }

    async cachePermissions(userId: number, permissions: string[]): Promise<void> {
        await this.redis.cachePermissions(userId, permissions);
    }

    async cacheProfiles(userId: number, profiles: string[]): Promise<void> {
        await this.redis.cacheProfiles(userId, profiles);
    }

    async setUsersList(users: any[], ttlSeconds = this.USERS_LIST_TTL): Promise<void> {
        await this.redis.set(this.USERS_LIST_KEY, users, ttlSeconds);
    }

    async getUsersList(): Promise<any[] | null> {
        return await this.redis.get<any[]>(this.USERS_LIST_KEY);
    }

    async clearUsersList(): Promise<void> {
        await this.redis.del(this.USERS_LIST_KEY);
    }

}
