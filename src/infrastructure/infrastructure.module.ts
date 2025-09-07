import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';

import { PersonRepository } from '@infrastructure/persistence/person/person.repository';

import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { SupplyItemRepository } from '@infrastructure/persistence/supply-item/repository/supply-item.repository';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { UserRepository } from '@infrastructure/persistence/user/user.repository';

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
		{
			provide: ISupplyItemRepository,
			useClass: SupplyItemRepository,
		},
	],
	exports: [IUserRepository, IPersonRepository, ISupplyItemRepository],
})
export class InfrastructureModule {}
