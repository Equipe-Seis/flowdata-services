//src\application\user\user-access.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { RedisService } from '@infrastructure/cache/redis.service';

@Injectable()
export class UserAccessService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    async updateUserPermissionsCache(userId: number): Promise<void> {
        const userWithProfiles = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userProfiles: {
                    include: {
                        profile: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Limpa cache anterior, independente se achou usuário ou não
        await this.redis.clearUserCache(userId);

        if (!userWithProfiles) {
            return;
        }

        const permissions =
            userWithProfiles.userProfiles.flatMap(up =>
                up.profile.permissions.map(p => p.permission.name),
            ) ?? [];

        const profiles =
            userWithProfiles.userProfiles.map(up => up.profile.name) ?? [];

        await this.redis.cachePermissions(userId, permissions);
        await this.redis.cacheProfiles(userId, profiles);
    }

}