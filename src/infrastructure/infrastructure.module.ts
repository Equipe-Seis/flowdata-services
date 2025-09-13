
import { Module } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

import { PersonRepository } from '@infrastructure/persistence/person/person.repository';

import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { SupplyItemRepository } from '@infrastructure/persistence/supply-item/repository/supply-item.repository';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/person/persistence/iperson.repository';
import { UserRepository } from '@infrastructure/persistence/user/user.repository';
import { RedisModule } from '@infrastructure/cache/redis.module';
import { RedisService } from '@infrastructure/cache/redis.service';
import { UserCache } from '@infrastructure/cache/user.cache';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { IProfileRepository } from '@application/profile/persistence/iprofile.repository';
import { ProfileRepository } from '@infrastructure/persistence/profile/profile.repository';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierRepository } from '@infrastructure/persistence/supplier/supplier.repository';

@Module({
	imports: [RedisModule],
	providers: [
		PrismaService,
		RedisService,
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
		{
			provide: IUserCache,
			useClass: UserCache,
		},
		{
			provide: IProfileRepository,
			useClass: ProfileRepository,
		},
		{
			provide: ISupplierRepository,
			useClass: SupplierRepository,
		}
	],
	exports: [PrismaService, RedisService, IUserRepository, IPersonRepository, ISupplyItemRepository, IUserCache, IProfileRepository, ISupplierRepository],
})
export class InfrastructureModule { }
