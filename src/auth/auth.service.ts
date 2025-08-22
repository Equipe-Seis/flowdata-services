import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/persistence/prisma/prisma.service';
import { SignInDto, SignUpDto } from './DTO';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import {
  forbidden,
  HttpError,
  isFail,
  Result,
  success,
  fail,
  internalServer,
} from 'src/domain/shared/result';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signup(dto: SignUpDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2002'
      ) {
        throw new ForbiddenException('Credentials are taken');
      }
    }
  }

  async signin(dto: SignInDto): Promise<Result<Partial<User>, HttpError>> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        hash: true,
      },
    });

    if (!user) {
      return forbidden('Credentials incorrect');
    }

    const passwordMatchResult = await this.passwordMatch(
      user.hash,
      dto.password,
    );

    if (isFail(passwordMatchResult)) {
      return fail(passwordMatchResult.error);
    }

    return success(user);
  }

  private async passwordMatch(
    hash: string,
    password: string,
  ): Promise<Result<boolean, HttpError>> {
    try {
      const passwordMatch = await argon.verify(hash, password);

      if (!passwordMatch) {
        return forbidden('Credentials incorrect');
      }

      return success(true);
    } catch (error) {
      return internalServer(error);
    }
  }
}
