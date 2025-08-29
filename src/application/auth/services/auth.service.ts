//#region Import
import { User } from 'generated/prisma';

import { JwtService } from '@nestjs/jwt';
import {
  Inject,
  Injectable,
} from '@nestjs/common';

import * as argon from 'argon2';

import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/auth/repository/iuser.repository';
import { Result } from 'src/domain/shared/result/result.pattern';
import { SignInDto, SignUpDto } from '../dto';
//#endregion

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUserRepository) private userRepository: IUserRepository,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto): Promise<Result<User>> {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.userRepository.create(dto.email, hash);
      return Result.Ok(user);
    } catch (error) {
      return Result.InternalServer(error);
    }
  }

  async signin(
    dto: SignInDto,
  ): Promise<Result<{access_token: string}>> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return Result.NotFound('User not found');
    }

    const passwordMatchResult = await this.passwordMatch(
      user.hash,
      dto.password,
    );

    if (passwordMatchResult.isFailure) {
      return Result.Fail(passwordMatchResult.error!);
    }

    return Result.Ok(
      await this.signInToken(user.id, user.email),
    );
  }

  private async passwordMatch(
    hash: string,
    password: string,
  ): Promise<Result<boolean>> {
    try {
      const passwordMatch = await argon.verify(hash, password);

      if (!passwordMatch) {
        return Result.Forbidden('Credentials incorrect');
      }

      return Result.Ok(true);
    } catch (error) {
      return Result.InternalServer(error);
    }
  }

  private async signInToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get(
        'TOKEN_EXPIRATION_IN_MINUTES',
      ),
      secret: this.config.get('TOKEN_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
