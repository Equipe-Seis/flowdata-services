import { CheckingLineModel } from '@domain/checking/models/checking-line.model';
import { CheckingModel } from '@domain/checking/models/checking.model';
import { CheckingWithLines } from '@domain/checking/types/checkingWithLines';
import { Result } from '@domain/shared/result/result.pattern';
import { Checking } from '@prisma/client';

export interface ICheckingRepository {
	create(model: CheckingModel): Promise<Result<Checking>>;

	findById(id: number): Promise<Result<CheckingWithLines | null>>;

	findAll(): Promise<Result<CheckingWithLines[]>>;

	addLines(
		checkingId: number,
		lines: CheckingLineModel[],
	): Promise<Result<CheckingWithLines>>;

	deleteLine(
		checkingId: number,
		lineId: number,
	): Promise<Result<CheckingWithLines>>;

	updateLine(
		checkingId: number,
		lineId: number,
		model: Partial<CheckingLineModel>,
	): Promise<Result<CheckingWithLines>>;
}

export const ICheckingRepository = Symbol('ICheckingRepository');
