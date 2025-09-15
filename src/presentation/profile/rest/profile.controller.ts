import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from '@application/profile/services/profile.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@domain/shared/decorator/public.decorator';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'List all profiles' })
    async getAll() {
        return this.profileService.getAllProfiles();
    }
    @Public()
    @Get(':id/permissions')
    @ApiOperation({ summary: 'List permissions for a specific profile' })
    async getPermissions(@Param('id', ParseIntPipe) id: number) {
        return this.profileService.getPermissions(id);
    }
}