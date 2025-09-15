
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PROFILES_KEY } from '@/domain/shared/constants/metadata-keys';
import { AuthorizationService } from '@application/authorization/services/authorization.service';

@Injectable()
export class ProfileGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
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

        return await this.authorizationService.profileAccessGranted(requiredProfiles, user.sub);
    }
}