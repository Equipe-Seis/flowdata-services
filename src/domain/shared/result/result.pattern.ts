import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const AppErrorType = {
  NotFound: 'NotFound',
  BadRequest: 'BadRequest',
  InternalServer: 'InternalServer',
  Forbidden: 'Forbidden',
  Unauthorized: 'Unauthorized',
} as const;

export type AppErrorTypeEnum = keyof typeof AppErrorType;

export class AppError extends Error {
  public readonly type: AppErrorTypeEnum;

  public constructor(
    message: string,
    type: AppErrorTypeEnum = AppErrorType.InternalServer,
  ) {
    super(message);
    this.type = type;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public static InternalServer(message: string): AppError {
    return new AppError(message);
  }

  public static NotFound(message: string): AppError {
    return new AppError(message, AppErrorType.NotFound);
  }

  public static BadRequest(message: string): AppError {
    return new AppError(message, AppErrorType.BadRequest);
  }

  public static Forbidden(message: string): AppError {
    return new AppError(message, AppErrorType.Forbidden);
  }

  public static Unauthorized(message: string): AppError {
    return new AppError(message, AppErrorType.Unauthorized);
  }
}

export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: AppError,
  ) { }

  public static Ok<U>(value: U): Result<U> {
    return new Result<U>(true, value);
  }

  public static Fail<U>(error: AppError | string): Result<U> {
    const appError = typeof error === 'string' ? new AppError(error) : error;
    return new Result<U>(false, undefined, appError);
  }

  private static toAppError(
    error: AppError | string,
    fallback: (msg: string) => AppError,
  ): AppError {
    return error instanceof AppError
      ? error
      : fallback(error);
  }

  public static InternalServer<U>(
    error: AppError | string,
  ): Result<U> {
    return this.Fail<U>(this.toAppError(error, AppError.InternalServer));
  }

  public static NotFound<U>(error: AppError | string): Result<U> {
    return this.Fail<U>(this.toAppError(error, AppError.NotFound));
  }

  public static BadRequest<U>(
    error: AppError | string,
  ): Result<U> {
    return this.Fail<U>(this.toAppError(error, AppError.BadRequest));
  }

  public static Forbidden<U>(
    error: AppError | string,
  ): Result<U> {
    return this.Fail<U>(this.toAppError(error, AppError.Forbidden));
  }

  public static Unauthorized<U>(
    error: AppError | string,
  ): Result<U> {
    return this.Fail<U>(this.toAppError(error, AppError.Unauthorized));
  }

  public get isFailure(): boolean {
    return !this.isSuccess;
  }

  public getValue(): T {
    if (!this.isSuccess || this.value === undefined) {
      throw new Error(
        'Cannot get the value of a failed result.',
      );
    }
    return this.value;
  }

  public getError(): AppError {
    if (this.isSuccess || this.error === undefined) {
      throw new Error(
        'Cannot get the error of a successful result.',
      );
    }
    return this.error;
  }

  public mapToPresentationResult():
    | T
    | HttpException
    | undefined {
    if (this.isSuccess) {
      return this.value;
    }

    return this.mapErrorToException(this.getError());
  }

  private mapErrorToException(
    error: AppError,
  ): HttpException {
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
