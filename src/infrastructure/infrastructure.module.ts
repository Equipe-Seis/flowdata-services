// src/infrastructure/infrastructure.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';

import { UserRepository } from '@infrastructure/persistence/repository/user.repository';
import { PersonRepository } from '@infrastructure/persistence/repository/shared/person/person.repository';
import { PersonModule } from '@infrastructure/persistence/repository/shared/person/person.module'; // Importando o módulo

import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { SupplyItemRepository } from '@infrastructure/persistence/supply-item/repository/supply-item.repository';
import { IUserRepository } from '@application/auth/repository/iuser.repository';
import { IPersonRepository } from '@application/auth/repository/shared/iperson.repository';

@Module({
  imports: [PersonModule],  // Adicionando PersonModule ao imports
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
    {
			provide: ISupplyItemRepository,
			useClass: SupplyItemRepository,
		},
  ],
  exports: [IUserRepository, IPersonRepository, ISupplyItemRepository],
})
export class InfrastructureModule { }
