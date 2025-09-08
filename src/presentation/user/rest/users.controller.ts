
import {
	Controller,
	Get,
	Param,
	Post,
	Put,
	Delete,
	Body,
	Req,
	UseGuards,
	HttpCode,
	HttpStatus,
	ParseIntPipe,
	UseInterceptors,
	ClassSerializerInterceptor
} from '@nestjs/common';

import { UserService } from '@application/user/user.service';
import { JwtGuard } from '@domain/shared/guard';
import { ProfileGuard } from '@domain/shared/guard/profile.guard';
import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import { ResponseUserDto } from '@application/user/dto/response-user.dto';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { HasPermission } from '@domain/shared/decorator/permission.decorator';
import { HasProfile } from '@domain/shared/decorator/profile.decorator';
@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UserService) { }

	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, description: 'User created successfully' })
	@ApiResponse({ status: 400, description: 'Invalid user data' })
	@ApiResponse({ status: 409, description: 'User already exists' })
	@Post()
	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin')
	async createUser(@Body() dto: CreateUserDto) {
		const result = await this.userService.createUser(dto);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Get the currently authenticated user' })
	@ApiResponse({
		status: 200,
		description: 'Authenticated user returned successfully',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized – invalid or missing token',
	})
	@UseGuards(JwtGuard)
	@Get('me')
	@HasPermission('read_user')
	async getMe(@Req() req: Request) {
		const userId = req.user?.['sub'];
		const user = await this.userService.getMe(userId);
		const plainUser = { ...user };
		//console.log('user recebido do service:', user);
		//console.log('user recebido do service:', plainUser);
		//return plainToInstance(ResponseUserDto, plainUser, {
		//excludeExtraneousValues: true,
		//});
		//const plainUser = { ...user.value };
		//delete plainUser.value.hash;
		return plainToInstance(ResponseUserDto, plainUser);
	}

	@ApiOperation({ summary: 'Get a user by ID' })
	@ApiResponse({
		status: 200,
		description: 'User found and returned successfully',
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@Get(':id')
	@HasPermission('read_user')
	async getUserById(@Param('id') id: string) {
		return this.userService.findById(Number(id));
	}

	@ApiOperation({ summary: 'Update a user by ID' })
	@ApiResponse({ status: 200, description: 'User updated successfully' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@Put(':id')
	async updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateUserDto,
	) {
		return this.userService.updateUser(id, dto);
	}

	@ApiOperation({ summary: 'Delete a user by ID' })
	@ApiResponse({ status: 204, description: 'User deleted successfully' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	@HasProfile('admin')
	async deleteUser(@Param('id', ParseIntPipe) id: number) {
		await this.userService.deleteUser(id);
	}

	/**@Get('admin-only')
	 @HasProfile('admin')
	async onlyAdmins() {
		return { message: 'Apenas admin pode acessar' };
	} */
}
