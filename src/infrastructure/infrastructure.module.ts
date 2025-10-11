
import { Module } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

import { PersonRepository } from '@infrastructure/persistence/person/person.repository';

import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { SupplyItemRepository } from '@infrastructure/persistence/supply-item/repository/supply-item.repository';
import { IUserRepository } from '@application/user/persistence/iuser.repository';
import { IPersonRepository } from '@application/person/persistence/iperson.repository';
import { UserRepository } from '@infrastructure/persistence/user/user.repository';
import { RedisCacheRepository } from '@infrastructure/cache/redis-cache.repository';
import { UserCache } from '@infrastructure/cache/user.cache';
import { IUserCache } from '@application/user/cache/iuser.cache';
import { IProfileRepository } from '@application/profile/persistence/iprofile.repository';
import { ProfileRepository } from '@infrastructure/persistence/profile/profile.repository';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierRepository } from '@infrastructure/persistence/supplier/supplier.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ICacheRepository } from '@application/user/cache/icache.repository';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingRepository } from '@infrastructure/persistence/checking/checking.repository';
import { ITransactionManager } from '@domain/shared/transaction/itrsanction.manager';
import { PrismaTransactionManager } from '@infrastructure/persistence/transaction/transaction.manager';
import { ISearchCnpjRepository } from '@/application/shared/cnpj/persistence/isearch-cnpj.repository';
import { SearchCnpjRepository } from '@/infrastructure/persistence/shared/cnpj/search-cnpj.repository';
import { IInventoryRepository } from '@application/inventory/persistence/iinvent.repository';
import { InventoryRepository } from '@infrastructure/persistence/inventory/inventory.repository';
import { IConcludeCheckingUnitOfWork } from '@application/checking/persistence/iconclude-checking.uow';
import { ConcludeCheckingUnitOfWork } from '@infrastructure/persistence/checking/conclude-checking.uow';

@Module({
	imports: [
		RedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (
				configService: ConfigService,
			): Promise<RedisModuleOptions> => ({
				type: 'single',
				options: {
					host: configService.get<string>('REDIS_HOST', 'localhost'),
					port: configService.get<number>('REDIS_PORT', 6379),
					password: configService.get<string>('REDIS_PASSWORD') || undefined,
				},
			}),
		}),
	],
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
		},
		{
			provide: ICacheRepository,
			useClass: RedisCacheRepository,
		},
		{
			provide: ICheckingRepository,
			useClass: CheckingRepository,
		},
		{
			provide: ITransactionManager,
			useClass: PrismaTransactionManager,
		},
		{
			provide: ISearchCnpjRepository,
			useClass: SearchCnpjRepository,
		},
		{
			provide: IInventoryRepository,
			useClass: InventoryRepository,
		},
		{
			provide: IConcludeCheckingUnitOfWork,
			useClass: ConcludeCheckingUnitOfWork,
		},
	],
	exports: [
		PrismaService,
		IUserRepository,
		IPersonRepository,
		ISupplyItemRepository,
		IUserCache,
		IProfileRepository,
		ISupplierRepository,
		ICacheRepository,
		ICheckingRepository,
		ITransactionManager,
		ISearchCnpjRepository,
		IInventoryRepository,
		IConcludeCheckingUnitOfWork,
	],
})
export class InfrastructureModule {}
