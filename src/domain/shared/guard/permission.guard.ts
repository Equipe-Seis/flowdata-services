
//src\domain\shared\guard\permission.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorator/permission.decorator';
import { UserAccessService } from '@application/user/user-access.service';  // serviço que atualiza cache
import { RedisService } from '@infrastructure/cache/redis.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
        private redis: RedisService,
        private userAccessService: UserAccessService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.sub) return false;

        // 1. Tenta pegar permissões do Redis
        let userPermissions = await this.redis.getPermissions(user.sub);
        console.log("1. Tenta pegar permissões do Redis", userPermissions);

        if (!userPermissions) {
            // 2. Não achou no cache? Busca no banco, atualiza cache e usa resultado
            await this.userAccessService.updateUserPermissionsCache(user.sub);
            userPermissions = await this.redis.getPermissions(user.sub);
        }

        // Se ainda não achou nada, falha (sem permissões)
        if (!userPermissions) return false;

        // Verifica se usuário tem todas permissões requeridas
        return requiredPermissions.every(p => userPermissions.includes(p));
    }
}
