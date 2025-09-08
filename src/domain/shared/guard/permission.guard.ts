

import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorator/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Se nenhuma permissão for necessária, libera
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.sub) return false;

        // Busca permissões do usuário via perfis
        const userWithProfiles = await this.prisma.user.findUnique({
            where: { id: user.sub },
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

        const userPermissions = userWithProfiles?.userProfiles.flatMap(up =>
            up.profile.permissions.map(pp => pp.permission.name),
        ) ?? [];

        // Verifica se o usuário possui TODAS as permissões exigidas
        return requiredPermissions.every(p => userPermissions.includes(p));
    }
}
