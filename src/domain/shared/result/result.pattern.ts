import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';

import { AppError, AppErrorType } from '@domain/shared/result/app-error';

export const ResponseType = {
	Success: 'Success',
	Created: 'Created',
	NoContent: 'NoContent',
	NotFound: 'NotFound',
	BadRequest: 'BadRequest',
	InternalServer: 'InternalServer',
	Forbidden: 'Forbidden',
	Unauthorized: 'Unauthorized',
} as const;

export type ResponseTypeEnum = keyof typeof ResponseType;

export class Result<T> {
	private constructor(
		public readonly isSuccess: boolean,
		private readonly responseType: ResponseTypeEnum,
		public readonly value?: T,
		public readonly error?: AppError | string,
	) {}

	public static Ok<U>(
		value?: U,
		responseType: ResponseTypeEnum = ResponseType.Success,
	): Result<U> {
		return new Result<U>(true, responseType, value);
	}

	public static Created<U>(value: U): Result<U> {
		return Result.Ok<U>(value, ResponseType.Created);
	}

	public static NoContent<U>(): Result<U> {
		return Result.Ok<U>(undefined, ResponseType.NoContent);
	}

	public static Fail<U>(
		error: AppError | string,
		responseType: ResponseTypeEnum = ResponseType.InternalServer,
	): Result<U> {
		return new Result<U>(false, responseType, undefined, error);
	}

	private static toAppError(
		error: AppError | string,
		fallback: (msg: string) => AppError,
	): AppError {
		return error instanceof AppError ? error : fallback(error);
	}

	public static InternalServer<U>(error: AppError | string): Result<U> {
		return this.Fail<U>(this.toAppError(error, AppError.InternalServer));
	}

	public static NotFound<U>(
		error: AppError | string = 'Content Not Found',
	): Result<U> {
		return this.Fail<U>(this.toAppError(error, AppError.NotFound));
	}

	public static BadRequest<U>(error: AppError | string): Result<U> {
		return this.Fail<U>(this.toAppError(error, AppError.BadRequest));
	}

	public static Forbidden<U>(error: AppError | string): Result<U> {
		return this.Fail<U>(this.toAppError(error, AppError.Forbidden));
	}

	public static Unauthorized<U>(error: AppError | string): Result<U> {
		return this.Fail<U>(this.toAppError(error, AppError.Unauthorized));
	}

	public get isFailure(): boolean {
		return !this.isSuccess;
	}

	public getValue(): T {
		if (!this.isSuccess || this.value === undefined) {
			throw new Error('Cannot get the value of a failed result.');
		}
		return this.value;
	}

	public getError(): AppError | string {
		if (this.isSuccess || this.error === undefined) {
			throw new Error('Cannot get the error of a successful result.');
		}
		return this.error;
	}

	public mapToPresentationResult(): T | HttpException | undefined {
		if (this.isSuccess) {
			return this.value;
		}

		const error = this.getError();

		if (typeof error == 'string') {
			throw new InternalServerErrorException(error);
		}

		throw this.mapErrorToException(error);
	}

	private mapErrorToException(error: AppError): HttpException {
		switch (error.type) {
			case AppErrorType.BadRequest:
				return new BadRequestException(error.message);
			case AppErrorType.Unauthorized:
				return new UnauthorizedException(error.message);
			case AppErrorType.Forbidden:
				return new ForbiddenException(error.message);
			case AppErrorType.NotFound:
				return new NotFoundException(error.message);
			case AppErrorType.InternalServer:
			default:
				return new InternalServerErrorException(error.message);
		}
	}
}
