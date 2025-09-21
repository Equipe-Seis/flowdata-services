import { Injectable } from '@nestjs/common';
import { Checking } from '@prisma/client';
import { ICheckingRepository } from '@application/checking/persistence/ichecking.repository';
import { CheckingModel } from '@domain/checking/models/checking.model';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { CheckingLineModel } from '@domain/checking/models/checking-line.model';

@Injectable()
export class CheckingRepository
	extends PrismaRepository
	implements ICheckingRepository
{
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

	async findById(id: number): Promise<Result<CheckingWithLines | null>> {
		return this.execute<CheckingWithLines | null>(() =>
			this.prismaService.checking.findUnique({
				where: { id },
				include: { lines: true },
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
