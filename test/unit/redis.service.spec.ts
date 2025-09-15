import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheRepository } from '@infrastructure/cache/redis-cache.repository';
import Redis from 'ioredis';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { ICacheRepository } from '@application/user/cache/icache.repository';

jest.setTimeout(10000);

describe('RedisService', () => {
	let service: RedisCacheRepository;
	let redisClient: Redis;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [InfrastructureModule],
		}).compile();

		service = module.get<ICacheRepository>(RedisCacheRepository);
		redisClient = (service as any).redisClient;
	});

	afterAll(async () => {
		await redisClient.quit();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should connect to Redis and set/get a value', async () => {
		const key = 'test_key';
		const value = { hello: 'world' };

		await service.set(key, value, 10);
		const result = await service.get<typeof value>(key);
		expect(result).toEqual(value);

		await service.del(key);
		const deleted = await service.get(key);
		expect(deleted).toBeNull();
	});
});
