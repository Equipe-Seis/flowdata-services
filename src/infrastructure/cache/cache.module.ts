import { Module } from '@nestjs/common';
import { RedisModule } from './redis.module';  // seu módulo do redis já configurado
import { RedisService } from './redis.service';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { UserCache } from './user.cache';

@Module({
    imports: [RedisModule],
    providers: [
        RedisService,
        {
            provide: IUserCache,
            useClass: UserCache,
        },
    ],
    exports: [IUserCache],
})
export class CacheModule { }