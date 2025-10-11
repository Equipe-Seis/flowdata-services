import { Result } from "@domain/shared/result/result.pattern";
import { ITransactionManager } from "@domain/shared/transaction/itrsanction.manager";
import { PrismaService } from "@infrastructure/persistence/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(cb: (tx: Prisma.TransactionClient) => Promise<Result<T>>): Promise<Result<T>> {
    try {
      return await this.prisma.$transaction(async (tx) => cb(tx));
    } catch (err) {
      return Result.InternalServer('Erro inesperado em transação');
    }
  }
}