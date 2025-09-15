import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { SupplyItemModel } from '@domain/supply-item/models/supply-item.model';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Injectable } from '@nestjs/common';
import { SupplyItem } from '@prisma/client';

@Injectable({})
export class SupplyItemRepository
	extends PrismaRepository
	implements ISupplyItemRepository
{
	getAll(): Promise<Result<Array<SupplyItem>>> {
		return this.execute<Array<SupplyItem>>(() =>
			this.prismaService.supplyItem.findMany(),
		);
	}

	getById(id: number): Promise<Result<SupplyItem | null>> {
		return this.execute<SupplyItem | null>(() =>
			this.prismaService.supplyItem.findFirst({
				where: {
					id: id,
				},
			}),
		);
	}

	update(id: number, item: SupplyItemModel): Promise<Result<SupplyItem>> {
		throw new Error('Method not implemented.');
	}

	async create(item: SupplyItemModel): Promise<Result<SupplyItem>> {
		return this.execute<SupplyItem>(() =>
			this.prismaService.supplyItem.create({
				data: { ...item },
			}),
		);
	}
}
