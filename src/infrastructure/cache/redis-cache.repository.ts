
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ICacheRepository } from '@application/user/cache/icache.repository';

@Injectable()
export class RedisCacheRepository implements ICacheRepository {
	constructor(@InjectRedis() private readonly redisClient: Redis) {}

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
}