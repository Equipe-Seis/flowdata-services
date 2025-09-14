import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@/domain/shared/constants/metadata-keys';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { UserAccessService } from '@application/user/services/user-access.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(IUserCache) private readonly userCache: IUserCache,
        private readonly userAccessService: UserAccessService,
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

        let userPermissions = await this.userCache.getPermissions(user.sub);

        if (!userPermissions) {
            await this.userAccessService.updateUserPermissionsCache(user.sub);
            userPermissions = await this.userCache.getPermissions(user.sub);
        }

        if (!userPermissions) return false;

        return requiredPermissions.every(p => userPermissions.includes(p));
    }
}