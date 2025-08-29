import { Result } from 'src/domain/shared/result/result.pattern';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

@Injectable()
export class PrismaRepository {
	constructor(protected prismaService: PrismaService) {}

	async execute<T>(
		cb: () => Promise<T>,
	): Promise<Result<T>> {
		try {
			const result = await cb();
			return Result.Ok(result);
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code == PRISMA_UNIQUE_CONSTRAINT_ERROR
			) {
				return Result.Forbidden('Unique constraint violation');	
			}

			return Result.InternalServer(
				'Unexpected database error',
			);
		}
	}
}
