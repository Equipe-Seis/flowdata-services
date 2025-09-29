import { FindAllSuppliesDto } from '@application/supply-item/dto/find-all-supplies.dto';
import { ISupplyItemRepository } from '@application/supply-item/persistence/isupply-item.repository';
import { Result } from '@domain/shared/result/result.pattern';
import { SupplyItemModel } from '@domain/supply-item/models/supply-item.model';
import { SupplyItemWithSupplier } from '@domain/supply-item/types/supplyItemSupplier';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Injectable } from '@nestjs/common';
import { Prisma, Status, SupplyItem } from '@prisma/client';

@Injectable({})
export class SupplyItemRepository
	extends PrismaRepository
	implements ISupplyItemRepository
{
	getByCode(code: string): Promise<Result<SupplyItemWithSupplier | null>> {
		return this.execute<SupplyItemWithSupplier | null>(() =>
			this.prismaService.supplyItem.findFirst({
				where: {
					code,
				},
				include: {
					supplier: true,
				},
			}),
		);
	}

	getAll(
		filters: FindAllSuppliesDto,
	): Promise<Result<Array<SupplyItemWithSupplier>>> {
		const { search, tipoInsumo, statusInsumo } = filters;

		const where: Prisma.SupplyItemWhereInput = {};

		if (search) {
			where.OR = [
				{
					name: {
						contains: search,
						mode: 'insensitive',
					},
				},
				{
					code: {
						contains: search,
						mode: 'insensitive',
					},
				},
			];
		}

		if (tipoInsumo && tipoInsumo.length > 0) {
			where.type = {
				in: tipoInsumo,
			};
		}

		if (statusInsumo && statusInsumo.length > 0) {
			where.status = {
				in: statusInsumo as Status[],
			};
		}

		return this.execute<Array<SupplyItemWithSupplier>>(() =>
			this.prismaService.supplyItem.findMany({
				where,
				include: {
					supplier: true,
				},
			}),
		);
	}

	getById(id: number): Promise<Result<SupplyItemWithSupplier | null>> {
		return this.execute<SupplyItemWithSupplier | null>(() =>
			this.prismaService.supplyItem.findFirst({
				where: {
					id: id,
				},
				include: {
					supplier: true,
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
