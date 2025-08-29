import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';

import { IUserRepository } from 'src/application/persistence/repository/interfaces/iuser.repository';
import { SignInDto, SignUpDto } from '../../dto';
import { AppError, Result } from 'src/domain/shared/result/result.pattern';
import { User } from '@domain/user/user.entity';
import { Person } from '@domain/shared/person/person.entity';
import { PersonType, Status } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  async signup(dto: SignUpDto): Promise<Result<User>> {

    const person = new Person(
      0,
      dto.person.name,
      PersonType.individual,
      dto.person.documentNumber,
      dto.person.birthDate ? new Date(dto.person.birthDate) : null,
      Status.active,
      dto.person.email,
    );

    const hash = await argon.hash(dto.password);

    const userToCreate = new User(
      0,
      person,
      hash,
    );

    //enviar para o repositório criar no banco
    try {
      const createdUser = await this.userRepository.create(userToCreate);
      return Result.Ok(createdUser);
    } catch (error) {
      if (error.code === 'P2002') {
        return Result.Fail(AppError.BadRequest('Email já está em uso.'));
      }
      return Result.InternalServer(error.message);
    }
  }


  async signin(dto: SignInDto): Promise<Result<{ access_token: string }>> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return Result.NotFound('Usuário não encontrado');
    }

    const isPasswordValid = await this.verifyPassword(user.hash, dto.password);
    if (!isPasswordValid) {
      return Result.Forbidden('Credenciais incorretas');
    }

    const token = await this.generateToken(user.id, user.person.email!);

    return Result.Ok({ access_token: token });
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon.verify(hash, password);
    } catch {
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
