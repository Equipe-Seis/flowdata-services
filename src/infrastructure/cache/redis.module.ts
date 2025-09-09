//src\infrastructure\cache\redis.module.ts
import { Module } from '@nestjs/common';
import {
    RedisModule as NestRedisModule,
    RedisModuleOptions,
} from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
    imports: [
        NestRedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (
                configService: ConfigService,
            ): Promise<RedisModuleOptions> => ({
                type: 'single',
                options: {
                    host: configService.get<string>('REDIS_HOST', 'localhost'),
                    port: configService.get<number>('REDIS_PORT', 6379),
                    password: configService.get<string>('REDIS_PASSWORD') || undefined,
                },
            }),
        }),
    ],
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule { }