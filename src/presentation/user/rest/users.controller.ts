//src\presentation\user\rest\users.controller.ts
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
	ClassSerializerInterceptor,
	Query
} from '@nestjs/common';

import { UserService } from '@application/user/services/user.service';
import { JwtGuard } from '@domain/shared/guard';
import { ProfileGuard } from '@infrastructure/auth/guards/profile.guard';
import { CreateUserDto } from '@application/user/dto/create-user.dto';
import { UpdateUserDto } from '@application/user/dto/update-user.dto';
import { ResponseUserDto } from '@application/user/dto/response-user.dto';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { HasPermission } from '@infrastructure/auth/decorators/permission.decorator';
import { HasProfile } from '@infrastructure/auth/decorators/profile.decorator';


@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UserService) { }


	@ApiOperation({ summary: 'Get all users' })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiResponse({ status: 200, description: 'List of users successfully returned', type: [ResponseUserDto] })
	@ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid' })
	@ApiForbiddenResponse({ description: 'Access denied.' })
	@Get()
	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin')
	async getAllUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
		const pageNumber = parseInt(page, 10);
		const limitNumber = parseInt(limit, 10);
		const { data, total } = await this.userService.getAllUsers(pageNumber, limitNumber);
		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limitNumber),
		};
	}

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

	@UseGuards(JwtGuard, ProfileGuard)
	@Get('me')
	@HasProfile('admin', 'supply_supervisor')
	async getMe(@Req() req: Request) {
		const userId = req.user?.['sub'];
		console.log("@getMe", userId);
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


	@UseGuards(JwtGuard, ProfileGuard)
	@Get(':id')
	@HasPermission('read_user')
	async getUserById(@Param('id') id: string) {
		return this.userService.findById(Number(id));
	}

	@ApiOperation({ summary: 'Update a user by ID' })
	@ApiResponse({ status: 200, description: 'User updated successfully' })
	@ApiResponse({ status: 404, description: 'User not found' })
	@Put(':id')
	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin')
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
