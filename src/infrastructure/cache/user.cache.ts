
import { Inject, Injectable } from '@nestjs/common';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { ICacheRepository } from '@application/user/cache/icache.repository';

const PERMISSIONS_PREFIX = 'user_permissions:';
const PROFILES_PREFIX = 'user_profiles:';
const CACHE_TTL_SECONDS = 3600;

@Injectable()
export class UserCache implements IUserCache {
	private readonly PERMISSIONS_PREFIX = 'user_permissions:';
	private readonly PROFILES_PREFIX = 'user_profiles:';
	private readonly DEFAULT_TTL = 60 * 60;

	private readonly USERS_LIST_KEY = 'users_list';
	private readonly USERS_LIST_TTL = 60 * 5;

	constructor(@Inject(ICacheRepository) private cache: ICacheRepository) {}

	async setPermissions(
		userId: number,
		permissions: string[],
		ttlSeconds = this.DEFAULT_TTL,
	): Promise<void> {
		const key = `${this.PERMISSIONS_PREFIX}${userId}`;
		await this.cache.set(key, permissions, ttlSeconds);
	}

	async getPermissions(userId: number): Promise<string[] | null> {
		const key = `${this.PERMISSIONS_PREFIX}${userId}`;
		return await this.cache.get<string[]>(key);
	}

	async setProfiles(
		userId: number,
		profiles: string[],
		ttlSeconds = this.DEFAULT_TTL,
	): Promise<void> {
		const key = `${this.PROFILES_PREFIX}${userId}`;
		await this.cache.set(key, profiles, ttlSeconds);
	}

	async getProfiles(userId: number): Promise<string[] | null> {
		const key = `${this.PROFILES_PREFIX}${userId}`;
		return await this.cache.get<string[]>(key);
	}

	async clear(userId: number): Promise<void> {
		await this.cache.del(`${this.PERMISSIONS_PREFIX}${userId}`);
		await this.cache.del(`${this.PROFILES_PREFIX}${userId}`);
	}

	async clearUserCache(userId: number): Promise<void> {
		await this.cache.del(PERMISSIONS_PREFIX + userId);
		await this.cache.del(PROFILES_PREFIX + userId);
	}

	async cachePermissions(userId: number, permissions: string[]): Promise<void> {
		await this.cache.set(
			PERMISSIONS_PREFIX + userId,
			permissions,
			CACHE_TTL_SECONDS,
		);
	}

	async cacheProfiles(userId: number, profiles: string[]): Promise<void> {
		await this.cache.set(PROFILES_PREFIX + userId, profiles, CACHE_TTL_SECONDS);
	}

	async setUsersList(
		users: any[],
		ttlSeconds = this.USERS_LIST_TTL,
	): Promise<void> {
		await this.cache.set(this.USERS_LIST_KEY, users, ttlSeconds);
	}

	async getUsersList(): Promise<any[] | null> {
		return await this.cache.get<any[]>(this.USERS_LIST_KEY);
	}

	async clearUsersList(): Promise<void> {
		await this.cache.del(this.USERS_LIST_KEY);
	}
}
