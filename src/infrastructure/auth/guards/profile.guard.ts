
//src\domain\shared\guard\profile.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from '@infrastructure/auth/decorators/profile.decorator';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { UserAccessService } from '@application/user/services/user-access.service';

@Injectable()
export class ProfileGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(IUserCache) private readonly userCache: IUserCache,
        private readonly userAccessService: UserAccessService,
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

        let userProfiles = await this.userCache.getProfiles(user.sub);


        if (!userProfiles) {
            await this.userAccessService.updateUserPermissionsCache(user.sub);
            userProfiles = await this.userCache.getProfiles(user.sub);

        }

        if (!userProfiles) return false;

        return requiredProfiles.some(profile => userProfiles.includes(profile));
    }
}