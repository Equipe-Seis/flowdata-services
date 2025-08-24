import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';
import { UserRepository } from './persistence/repository/user.repository';
import { IUserRepository } from 'src/application/persistence/repository/interfaces/iuser.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepository],
})
export class InfrastructureModule {}
