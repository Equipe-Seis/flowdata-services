import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';

import { Result } from '@domain/shared/result/result.pattern';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { SignInDto } from '@application/auth/dto';
import { UserAccessService } from '@application/user/user-access.service';

@Injectable()
export class AuthService {
	constructor(
		@Inject(IUserRepository)
		private readonly userRepository: IUserRepository,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
		private readonly userAccessService: UserAccessService
	) { }

	async signin(dto: SignInDto): Promise<Result<{ access_token: string }>> {
		const userResult = await this.userRepository.findByEmail(dto.email);

		console.log("userResult", userResult);

		if (userResult.isFailure) {
			return Result.Fail(userResult.getError());
		}

		const user = userResult.getValue();

		if (user == null) {
			return Result.NotFound('User not found');
		}

		const isPasswordValid = await this.verifyPassword(user.hash, dto.password);

		if (!isPasswordValid) {
			return Result.Forbidden('Incorrect credentials');
		}

		//await this.userAccessService.updateUserPermissionsCache(user.id);

		const token = await this.generateToken(user.id, user.person.email!);

		return Result.Ok({ access_token: token });
	}

	private async verifyPassword(
		hash: string,
		password: string,
	): Promise<boolean> {
		try {
			return await argon.verify(hash, password);
		} catch (error) {
			console.log("error", error)
			return false;
		}
	}

	private async generateToken(userId: number, email: string): Promise<string> {
		const payload = { sub: userId, email };
		return this.jwt.signAsync(payload, {
			secret: this.config.get('TOKEN_SECRET'),
			expiresIn: this.config.get('TOKEN_EXPIRATION_IN_MINUTES'),
		});
	}
}
