import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';
import { UserRepository } from '@infrastructure/persistence/repository/user.repository';
import { PersonRepository } from '@infrastructure/persistence/repository/shared/person/person.repository';

import { IUserRepository } from '@application/persistence/repository/interfaces/iuser.repository';
import { IPersonRepository } from '@application/persistence/repository/interfaces/shared/iperson.repository';

//src\infrastructure\infrastructure.module.ts
@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IPersonRepository,
      useClass: PersonRepository,
    },
  ],
  exports: [IUserRepository, IPersonRepository],
})
export class InfrastructureModule { }
