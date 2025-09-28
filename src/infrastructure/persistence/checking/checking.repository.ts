import { Injectable } from '@nestjs/common';
import { Checking, CheckingStatus } from '@prisma/client';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingModel } from '@domain/checking/models/checking.model';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import {
	CheckingWithLines,
	CheckingWithSupplyItem,
} from '@domain/checking/types/checkingWithLines';
import { CheckingLineModel } from '@domain/checking/models/checking-line.model';
import { InventTransferLineModel } from '@domain/transfer/models/invent-transfer-line.model';
import { InventTransferModel } from '@domain/transfer/models/invent-transfer.model';
import { InventTransferWithLines } from '@domain/transfer/types/inventTrasnferWithLines';

@Injectable()
export class CheckingRepository
	extends PrismaRepository
	implements ICheckingRepository
{
	async delete(id: number): Promise<Result<number>> {
		return this.execute<number>(async () => {
			const deleted = await this.prismaService.checking.delete({
				where: {
					id: id,
				},
			});

			return deleted.id;
		});
	}

	async findTransferById(
		inventTransferId: number,
	): Promise<Result<InventTransferWithLines | null>> {
		return this.execute<InventTransferWithLines | null>(() =>
			this.prismaService.inventTransfer.findUnique({
				where: { id: inventTransferId },
				include: { inventTransferLines: true },
			}),
		);
	}

	async updateCheckingStatus(
		id: number,
		status: CheckingStatus,
	): Promise<Result<CheckingWithLines>> {
		return this.execute<CheckingWithLines>(() =>
			this.prismaService.checking.update({
				where: { id: id },
				data: { status },
				include: { lines: true },
			}),
		);
	}

	async createTransfer(
		model: InventTransferModel,
	): Promise<Result<InventTransferWithLines>> {
		return this.execute<InventTransferWithLines>(() =>
			this.prismaService.inventTransfer.create({
				data: { ...model },
				include: {
					inventTransferLines: true,
				},
			}),
		);
	}

	async createTransferLines(
		inventTransferId: number,
		lines: InventTransferLineModel[],
	): Promise<Result<InventTransferWithLines>> {
		return this.execute<InventTransferWithLines>(() =>
			this.prismaService.inventTransfer.update({
				where: { id: inventTransferId },
				data: {
					inventTransferLines: {
						create: lines,
					},
				},
				include: { inventTransferLines: true },
			}),
		);
	}

	async addLines(
		checkingId: number,
		lines: CheckingLineModel[],
	): Promise<Result<CheckingWithLines>> {
		return this.execute<CheckingWithLines>(() =>
			this.prismaService.checking.update({
				where: { id: checkingId },
				data: {
					lines: {
						create: lines,
					},
				},
				include: { lines: true },
			}),
		);
	}

	async deleteLine(
		checkingId: number,
		lineId: number,
	): Promise<Result<CheckingWithLines>> {
		return this.execute<CheckingWithLines>(() =>
			this.prismaService.checking.update({
				where: { id: checkingId },
				data: {
					lines: {
						delete: { id: lineId },
					},
				},
				include: { lines: true },
			}),
		);
	}

	async updateLine(
		checkingId: number,
		lineId: number,
		line: Partial<CheckingLineModel>,
	): Promise<Result<CheckingWithLines>> {
		return this.execute<CheckingWithLines>(() =>
			this.prismaService.checking.update({
				where: { id: checkingId },
				data: {
					lines: {
						update: {
							where: { id: lineId },
							data: line,
						},
					},
				},
				include: { lines: true },
			}),
		);
	}

	async create(model: CheckingModel): Promise<Result<Checking>> {
		return this.execute<Checking>(() =>
			this.prismaService.checking.create({
				data: {
					...model,
				},
			}),
		);
	}

	async findById(id: number): Promise<Result<CheckingWithSupplyItem | null>> {
		return this.execute<CheckingWithSupplyItem | null>(() =>
			this.prismaService.checking.findUnique({
				where: { id },
				include: {
					lines: {
						include: {
							supplyItem: true,
						},
					},
				},
			}),
		);
	}

	async findAll(): Promise<Result<CheckingWithLines[]>> {
		return this.execute<CheckingWithLines[]>(() =>
			this.prismaService.checking.findMany({
				include: { lines: true },
			}),
		);
	}
}
