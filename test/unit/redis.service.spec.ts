import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@infrastructure/cache/redis.service';
import { RedisModule } from '@infrastructure/cache/redis.module';
import Redis from 'ioredis';

jest.setTimeout(10000);

describe('RedisService', () => {
    let service: RedisService;
    let redisClient: Redis;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule],
            providers: [RedisService],
        }).compile();

        service = module.get<RedisService>(RedisService);
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
