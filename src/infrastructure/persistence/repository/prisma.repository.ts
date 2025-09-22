import { Result } from '@domain/shared/result/result.pattern';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

@Injectable()
export class PrismaRepository {
	constructor(protected prismaService: PrismaService) {}

	protected async execute<T>(cb: () => Promise<T>): Promise<Result<T>> {
		try {
			const result = await cb();
			return Result.Ok(result);
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code == PRISMA_UNIQUE_CONSTRAINT_ERROR
			) {
				return Result.Forbidden('Unique constraint violation.');
			}

			return Result.InternalServer('Unexpected database error');
		}
	}

	public async transaction<T>(
		cb: (tx: Prisma.TransactionClient) => Promise<T>,
	): Promise<Result<T>> {
		try {
			const result = await this.prismaService.$transaction(async (tx) => {
				return cb(tx);
			});
			return Result.Ok(result);
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code == PRISMA_UNIQUE_CONSTRAINT_ERROR
			) {
				return Result.Forbidden('Unique constraint violation.');
			}

			return Result.InternalServer('Unexpected database error');
		}
	}
}
