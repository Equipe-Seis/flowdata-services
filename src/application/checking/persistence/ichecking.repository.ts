import { CheckingLineModel } from '@domain/checking/models/checking-line.model';
import { CheckingModel } from '@domain/checking/models/checking.model';
import {
	CheckingWithLines,
	CheckingWithSupplyItem,
} from '@domain/checking/types/checkingWithLines';
import { Result } from '@domain/shared/result/result.pattern';
import { InventTransferLineModel } from '@domain/transfer/models/invent-transfer-line.model';
import { InventTransferModel } from '@domain/transfer/models/invent-transfer.model';
import { InventTransferWithLines } from '@domain/transfer/types/inventTrasnferWithLines';
import { Checking, CheckingStatus } from '@prisma/client';

export interface ICheckingRepository {
	create(model: CheckingModel): Promise<Result<Checking>>;

	updateCheckingStatus(
		id: number,
		status: CheckingStatus,
	): Promise<Result<CheckingWithLines>>;

	findById(id: number): Promise<Result<CheckingWithSupplyItem | null>>;

	findAll(): Promise<Result<CheckingWithLines[]>>;

	//#region Lines
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
	//#endregion

	// #region Transfer
	findTransferById(
		inventTransferId: number,
	): Promise<Result<InventTransferWithLines | null>>;

	createTransfer(
		model: InventTransferModel,
	): Promise<Result<InventTransferWithLines>>;

	createTransferLines(
		inventTransferId: number,
		lines: InventTransferLineModel[],
	): Promise<Result<InventTransferWithLines>>;
	// #endregion
}

export const ICheckingRepository = Symbol('ICheckingRepository');
