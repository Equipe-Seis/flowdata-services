
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { PROFILES_KEY } from '../decorator/profile.decorator';

@Injectable()
export class ProfileGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
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

        const userProfiles = await this.prisma.userProfile.findMany({
            where: { id: user.sub },
            include: { profile: true },
        });

        const userProfileNames = userProfiles.map(up => up.profile.name);

        return requiredProfiles.some(profile => userProfileNames.includes(profile));
    }
}
