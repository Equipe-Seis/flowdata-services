import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
	InventSumBatchCheckpoint,
	InventTransferLine,
	Prisma,
	TransferType,
} from '@prisma/client';

// TODO: export type from another file
export type InventTransferLineWithTransfer =
	Prisma.InventTransferLineGetPayload<{
		include: { inventTransfer: true };
	}>;

// TODO: refactor to repository pattern
// TODO: improve logs
// TODO: add startstop configuration
@Injectable()
export class InventJobService {
	private readonly logger = new Logger(InventJobService.name);

	private readonly BATCH_SIZE = 200;

	constructor(private readonly prisma: PrismaService) {}

	@Cron(CronExpression.EVERY_10_SECONDS)
	async main() {
		this.logger.log('Starting InventSum sync...');

		let processedCount = 0;
		let errorCount = 0;

		let checkpoint = await this.checkpoint();

		let lastProcessedId = checkpoint.lastProcessedTransferId;

		const lines = await this.prisma.inventTransferLine.findMany({
			where: {
				id: {
					gt: lastProcessedId,
				},
			},
			include: { inventTransfer: true },
			orderBy: { id: 'asc' },
			take: this.BATCH_SIZE,
		});

		this.logger.log(
			`📦 Found ${lines.length} new transfer line(s) to process (id > ${lastProcessedId})`,
		);

		const { processed, errors } = await this.processErrorTransactions();

		processedCount += processed;
		errorCount += errors;

		for (const line of lines) {
			try {
				lastProcessedId = await this.handleLine(line);
				processedCount++;
			} catch (err) {
				await this.handleLineError(line, err);
				errorCount++;
			}
		}

		if (lastProcessedId > checkpoint.lastProcessedTransferId) {
			await this.prisma.inventSumBatchCheckpoint.update({
				where: { id: checkpoint.id },
				data: { lastProcessedTransferId: lastProcessedId },
			});
			this.logger.log(`🔖 Checkpoint advanced to ${lastProcessedId}`);
		}

		this.logger.log(
			`🎉 Inventory sync finished — processed=${processedCount}, errors=${errorCount}`,
		);
	}

	//#region Private
	private async processErrorTransactions() {
		let errors = 0;
		let processed = 0;

		const pendingErrors = await this.prisma.inventTransferErrors.findMany({
			where: { retried: false },
			orderBy: { createdAt: 'asc' },
			take: this.BATCH_SIZE,
		});

		if (pendingErrors.length > 0) {
			this.logger.log(
				`🔁 Found ${pendingErrors.length} pending error(s) to retry`,
			);
		}

		for (const errRow of pendingErrors) {

			const originalIdNum = Number(errRow.originalId);

			try {
				const line = await this.prisma.inventTransferLine.findUnique({
					where: { id: originalIdNum },
					include: { inventTransfer: true },
				});

				if (!line) {
					await this.prisma.inventTransferErrors.update({
						where: { id: errRow.id },
						data: {
							retried: true,
							success: false,
							errorMessage: 'InventTransferLine not found',
						},
					});

					this.logger.warn(
						`⚠️ Error ${errRow.id}: original transfer line ${originalIdNum} not found`,
					);

					errors++;
					continue;
				}

				await this.handleLine(line);

				await this.prisma.inventTransferErrors.update({
					where: { id: errRow.id },
					data: { retried: true, success: true, errorMessage: null },
				});

				this.logger.log(`✅ Reprocessed error originalId=${originalIdNum}`);

				processed++;
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err) 
				await this.prisma.inventTransferErrors.update({
					where: { id: errRow.id },
					data: {
						errorMessage: message,
						retried: false,
						success: false,
					},
				});

				this.logger.error(
					`❌ Failed to reprocess error originalId = ${originalIdNum}: ${message}`,
				);

				errors++;
			}
		}

		this.logger.log(
			`Transactions in error state processed — processed = ${processed}, errors = ${errors}`,
		);

		return { processed, errors };
	}

	private async checkpoint(): Promise<InventSumBatchCheckpoint> {
		let checkpoint = await this.prisma.inventSumBatchCheckpoint.findFirst();

		if (!checkpoint) {
			checkpoint = await this.prisma.inventSumBatchCheckpoint.create({
				data: { lastProcessedTransferId: 0 },
			});
			this.logger.log(`🔖 Created checkpoint with id=${checkpoint.id}`);
		}

		return checkpoint;
	}

	private async handleLine(line: InventTransferLineWithTransfer): Promise<number> {
		const transfer = line.inventTransfer;
		if (!transfer) throw new Error('inventTransfer not loaded on line');

		const qtyNum = line.transferQty.toNumber();
		const delta =
			transfer.transferType == TransferType.inbound ? qtyNum : -qtyNum;

		const current = await this.prisma.inventSum.findFirst({
			where: {
				supplyItemId: line.supplyItemId,
			},
		});

		if (!current) {
			const created = await this.prisma.inventSum.create({
				data: {
					supplyItemId: line.supplyItemId,
					unitOfMeasure: line.unitOfMeasure,
					quantity: delta,
				},
			});

			await this.prisma.inventSumHistory.create({
				data: {
					supplyItemId: line.supplyItemId,
					unitOfMeasure: line.unitOfMeasure,
					previousQty: 0,
					newQty: created.quantity,
					changedQty: delta,
					transferLineId: line.id,
				},
			});

			return line.id;
		}

		await this.prisma.inventSum.update({
			where: { id: current.id },
			data: { quantity: { increment: delta } },
		});

		const updated = await this.prisma.inventSum.findUnique({
			where: { id: current.id },
		});

		const prev = current.quantity.toNumber();
		const newQty = updated!.quantity.toNumber();

		await this.prisma.inventSumHistory.create({
			data: {
				supplyItemId: line.supplyItemId,
				unitOfMeasure: line.unitOfMeasure,
				previousQty: prev,
				newQty: newQty,
				changedQty: newQty - prev,
				transferLineId: line.id,
			},
		});

		return line.id;
	}

	private async handleLineError(line: InventTransferLine, err: unknown) {
		const message = err instanceof Error ? err.message : String(err);

		this.logger.error(
			`❌ Failed to process line id=${line.id}: ${message ?? err}`,
		);

		const originalIdStr = String(line.id);

		const existing = await this.prisma.inventTransferErrors.findFirst({
			where: { originalId: originalIdStr },
		});

		if (existing) {
			await this.prisma.inventTransferErrors.update({
				where: { id: existing.id },
				data: {
					retried: false,
					success: false,
					errorMessage: message,
				},
			});

			return;
		}

		await this.prisma.inventTransferErrors.create({
			data: {
				originalId: originalIdStr,
				retried: false,
				success: false,
				errorMessage: message,
			},
		});
	}
	//#endregion
}
