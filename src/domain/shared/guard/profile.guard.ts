
//src\domain\shared\guard\profile.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from '../decorator/profile.decorator';
import { RedisService } from '@infrastructure/cache/redis.service';
import { UserAccessService } from '@application/user/user-access.service';

@Injectable()
export class ProfileGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private redis: RedisService,
        private userAccessService: UserAccessService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredProfiles = this.reflector.getAllAndOverride<string[]>(
            PROFILES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredProfiles || requiredProfiles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.sub) return false;

        // Tenta pegar perfis do cache
        let userProfiles = await this.redis.getProfiles(user.sub);
        console.log("1. Tenta pegar permissões do Redis", userProfiles);

        if (!userProfiles) {
            // Se não tiver, atualiza cache via UserAccessService
            await this.userAccessService.updateUserPermissionsCache(user.sub);
            userProfiles = await this.redis.getProfiles(user.sub);
        }

        if (!userProfiles) return false;

        // Verifica se usuário tem pelo menos um dos perfis requeridos
        return requiredProfiles.some(profile => userProfiles.includes(profile));
    }
}

