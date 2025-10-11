import { Result } from "@domain/shared/result/result.pattern";
import { InventTransferLineModel } from "@domain/transfer/models/invent-transfer-line.model";
import { InventTransferWithLines } from "@domain/transfer/types/inventTrasnferWithLines";

export interface IConcludeCheckingUnitOfWork {
    doWork(checkingId: number, lines: InventTransferLineModel[]): Promise<Result<InventTransferWithLines | null>> 
}

export const  IConcludeCheckingUnitOfWork = Symbol('IConcludeCheckingUnitOfWork');