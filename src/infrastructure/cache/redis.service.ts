import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

const PERMISSIONS_PREFIX = 'user:permissions:';
const PROFILES_PREFIX = 'user:profiles:';
const CACHE_TTL_SECONDS = 3600;

@Injectable()
export class RedisService {
    constructor(@InjectRedis() private readonly redisClient: Redis) { }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const data = JSON.stringify(value);
        if (ttlSeconds) {
            await this.redisClient.set(key, data, 'EX', ttlSeconds);
        } else {
            await this.redisClient.set(key, data);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async cachePermissions(userId: number, permissions: string[]): Promise<void> {
        await this.set(PERMISSIONS_PREFIX + userId, permissions, CACHE_TTL_SECONDS);
    }

    async getPermissions(userId: number): Promise<string[] | null> {
        return this.get<string[]>(PERMISSIONS_PREFIX + userId);
    }

    async cacheProfiles(userId: number, profiles: string[]): Promise<void> {
        await this.set(PROFILES_PREFIX + userId, profiles, CACHE_TTL_SECONDS);
    }

    async getProfiles(userId: number): Promise<string[] | null> {
        return this.get<string[]>(PROFILES_PREFIX + userId);
    }

    async clearUserCache(userId: number): Promise<void> {
        await this.del(PERMISSIONS_PREFIX + userId);
        await this.del(PROFILES_PREFIX + userId);
    }


}