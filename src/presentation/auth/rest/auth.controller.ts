import { Body, Controller, Post } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@application/auth/services/auth.service';
import { SignInDto } from '@application/auth/dto';
import { Public } from '@presentation/shared/decorator/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@ApiOperation({ summary: 'User login' })
	@ApiResponse({ status: 200, description: 'User logged in successfully' })
	@Public()
	@Post('signin')
	async signin(@Body() dto: SignInDto) {
		const result = await this.authService.signin(dto);
		return result.mapToPresentationResult();
	}
}
