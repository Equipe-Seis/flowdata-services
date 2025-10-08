import { IConcludeCheckingUnitOfWork } from '@application/checking/persistence/iconclude-checking.uow';
import { Result } from '@domain/shared/result/result.pattern';
import { InventTransferLineModel } from '@domain/transfer/models/invent-transfer-line.model';
import { InventTransferWithLines } from '@domain/transfer/types/inventTrasnferWithLines';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { CheckingStatus, Prisma, TransferType } from '@prisma/client';

export class ConcludeCheckingUnitOfWork
	extends PrismaRepository
	implements IConcludeCheckingUnitOfWork
{
	async doWork(
		checkingId: number,
		lines: InventTransferLineModel[],
	): Promise<Result<InventTransferWithLines | null>> {
		return this.transaction(async (tx: Prisma.TransactionClient) => {
			const transfer = await tx.inventTransfer.create({
				data: {
					transferType: TransferType.inbound,
					inventTransferLines: {
						create: lines,
					},
				},
				include: {
					inventTransferLines: true,
				},
			});

			await tx.checking.update({
				where: { id: checkingId },
				data: { status: CheckingStatus.received },
			});

			return transfer;
		});
	}
}
