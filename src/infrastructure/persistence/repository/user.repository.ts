// src/infrastructure/persistence/repository/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IUserRepository } from '@application/persistence/repository/interfaces/iuser.repository';
import { User } from '@domain/user/user.entity';
import { Result } from '@domain/shared/result/result.pattern';
import { AppError } from '@domain/shared/result/result.pattern';
import { PersonRepository } from './shared/person/person.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personRepository: PersonRepository,
  ) { }

  async create(user: User): Promise<Result<User>> {
    try {
      const existingPerson = await this.personRepository.findByDocumentNumber(user.person.documentNumber);

      if (!existingPerson) {
        const createdPerson = await this.personRepository.create({
          name: user.person.name,
          documentNumber: user.person.documentNumber,
          birthDate: user.person.birthDate,
          personType: user.person.personType,
          status: user.person.status,
          email: user.person.email,
        });

        const createdUser = await this.prisma.user.create({
          data: {
            personId: createdPerson.id,
            hash: user.hash,
          },
        });

        return Result.Ok(new User(createdUser.id, createdPerson, createdUser.hash));
      } else {
        const createdUser = await this.prisma.user.create({
          data: {
            personId: existingPerson.id,
            hash: user.hash,
          },
        });

        return Result.Ok(new User(createdUser.id, existingPerson, createdUser.hash));
      }
    } catch (error) {
      console.error(error);
      return Result.Fail(AppError.InternalServer('Error creating user.'));
    }
  }

  async findById(id: number): Promise<Result<User>> {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { id },
        include: { person: true },
      });

      if (!foundUser) {
        return Result.Fail('User not found');
      }

      return Result.Ok(new User(foundUser.id, foundUser.person, foundUser.hash));
    } catch (error) {
      return Result.Fail('Error finding user by ID');
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const foundPerson = await this.prisma.person.findUnique({
        where: { email },
      });

      if (!foundPerson) {
        return Result.Fail('User not found');
      }

      const foundUser = await this.prisma.user.findUnique({
        where: { personId: foundPerson.id },
        include: { person: true }, // Incluir a pessoa associada ao usuário
      });

      if (!foundUser) {
        return Result.Fail('User not found');
      }

      return Result.Ok(new User(foundUser.id, foundUser.person, foundUser.hash));
    } catch (error) {
      return Result.Fail('Error finding user by email');
    }
  }

  async update(user: User): Promise<Result<User>> {
    const prisma = this.prisma;

    try {
      // Verificar se a pessoa associada ao usuário realmente existe
      const existingPerson = await prisma.person.findUnique({
        where: { id: user.person.id },
      });

      if (!existingPerson) {
        return Result.Fail('Pessoa associada ao usuário não encontrada.');
      }

      // Iniciar uma transação para atualizar tanto o usuário quanto a pessoa
      const updatedUser = await prisma.$transaction(async (tx) => {
        const updatedPerson = await tx.person.update({
          where: { id: user.person.id },
          data: {
            name: user.person.name,
            personType: user.person.personType,
            documentNumber: user.person.documentNumber,
            birthDate: user.person.birthDate,
            status: user.person.status,
            email: user.person.email,
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            personId: updatedPerson.id,
            hash: user.hash,
          },
        });

        return new User(updatedUser.id, updatedPerson, updatedUser.hash);


      });

      return Result.Ok(updatedUser);
    } catch (error) {
      console.error(error);
      return Result.Fail('Error updating user.');
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return Result.Ok(undefined);
    } catch (error) {
      return Result.Fail('Error deleting user');
    }
  }
}
