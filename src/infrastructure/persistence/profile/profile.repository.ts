import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IProfileRepository } from '@application/profile/persistence/iprofile.repository';
import { Profile } from '@domain/profile/models/profile.model';

@Injectable()
export class ProfileRepository implements IProfileRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Profile[]> {
        const profiles = await this.prisma.profile.findMany();
        return profiles.map(
            (p) => new Profile(p.id, p.name, p.description)
        );
    }

    async findPermissionsByProfileId(profileId: number): Promise<string[]> {
        const profile = await this.prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!profile) return [];

        return profile.permissions.map((p) => p.permission.name);
    }

    async countByIds(profileIds: number[]): Promise<number> {
        return await this.prisma.profile.count({
            where: {
                id: { in: profileIds }
            }
        });
    }
}