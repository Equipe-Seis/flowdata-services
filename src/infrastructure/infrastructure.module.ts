import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma/prisma.service';

import { IUserRepository } from 'src/application/auth/repository/iuser.repository';
import { ISupplyItemRepository } from 'src/application/supply-item/persistence/isupply-item.repository';

import { SupplyItemRepository } from './persistence/supply-item/repository/supply-item.repository';
import { UserRepository } from './persistence/user/user.repository';
import { PrismaRepository } from './persistence/repository/prisma.repository';

@Module({
	providers: [
		PrismaService,
		PrismaRepository,
		{
			provide: IUserRepository,
			useClass: UserRepository,
		},
		{
			provide: ISupplyItemRepository,
			useClass: SupplyItemRepository,
		},
	],
	exports: [IUserRepository, ISupplyItemRepository],
})
export class InfrastructureModule {}
