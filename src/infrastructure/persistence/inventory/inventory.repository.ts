import { IInventoryRepository } from '@application/inventory/persistence/iinvent.repository';
import { InventSumWithSupplyItemAndSupplier } from '@domain/inventory/types/inventSumWithSupplyItem';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';

export class InventoryRepository
	extends PrismaRepository
	implements IInventoryRepository
{
	findAll(): Promise<Result<InventSumWithSupplyItemAndSupplier[]>> {
		return this.execute<InventSumWithSupplyItemAndSupplier[]>(() =>
			this.prismaService.inventSum.findMany({
				include: {
					supplyItem: {
						include: {
							supplier: true,
						},
					},
				},
			}),
		);
	}
}
