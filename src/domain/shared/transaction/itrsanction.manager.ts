import { Result } from "@domain/shared/result/result.pattern";
import { Prisma } from "@prisma/client";

export interface ITransactionManager {
  execute<T>(cb: (tx: Prisma.TransactionClient) => Promise<Result<T>>): Promise<Result<T>>;
}

export const ITransactionManager = Symbol('ITransactionManager')