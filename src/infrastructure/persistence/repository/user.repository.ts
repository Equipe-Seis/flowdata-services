// src/infrastructure/persistence/repository/user.repository.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { IUserRepository } from '@application/persistence/repository/interfaces/iuser.repository';
import { User } from '@domain/user/user.entity';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Person } from '@domain/shared/person/person.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(user: User): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: {
          hash: user.hash,
          person: {
            connect: {
              id: user.person.id,
            },
          },
        },
        include: {
          person: true,
        },
      });

      const person = new Person(
        created.person.id,
        created.person.name,
        created.person.personType,
        created.person.documentNumber,
        created.person.birthDate,
        created.person.status,
        created.person.email,
      );

      return new User(created.id, person, created.hash);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Este usuário já existe.');
      }

      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!user) return null;

    const person = new Person(
      user.person.id,
      user.person.name,
      user.person.personType,
      user.person.documentNumber,
      user.person.birthDate,
      user.person.status,
      user.person.email,
    );

    return new User(user.id, person, user.hash);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        person: {
          email,
        },
      },
      include: { person: true },
    });

    if (!user) return null;

    const person = new Person(
      user.person.id,
      user.person.name,
      user.person.personType,
      user.person.documentNumber,
      user.person.birthDate,
      user.person.status,
      user.person.email,
    );

    return new User(user.id, person, user.hash);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hash: user.hash,
        person: {
          update: {
            name: user.person.name,
            personType: user.person.personType,
            documentNumber: user.person.documentNumber,
            birthDate: user.person.birthDate,
            status: user.person.status,
            email: user.person.email,
          },
        },
      },
      include: { person: true },
    });

    return new User(
      updated.id,
      updated.person,
      updated.hash,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
