import { BadRequestException, ForbiddenException, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

type EitherSuccess<Data> = {
    isSuccess: true,
    value: Data
}

type EitherFail<Err> = {
    isSuccess: false,
    error: Err
}

export type Either<Data, Err> = EitherSuccess<Data> | EitherFail<Err>;

export const fail = <Err>(error: Err): Either<never, Err> => ({
    isSuccess: false,
    error
})

export const success = <Data>(value: Data): Either<Data, never> => ({
    isSuccess: true,
    value 
})

export const isFail = <Data, Err>(
    either: Either<Data, Err>,
): either is EitherFail<Err> => {
    return !either.isSuccess;
}

export const isSuccess = <Data, Err>(
    either: Either<Data, Err>,
): either is EitherSuccess<Data> => {
    return either.isSuccess;
}

export type Result<DATA, ERROR> = Either<DATA, ERROR>;

export const Error = {
    NotFound: "NotFound",
    BadRequest: "BadRequest",
    InternalServer: "InternalServer",
    Forbidden: "Forbidden",
    Unauthorized: "Unauthorized"
} as const;

export type ErrorKeys = keyof typeof Error;

export type HttpError = {
    type: ErrorKeys;
    message: string;
}

export const badRequest = (msg: string): Either<never, HttpError> =>
    fail({ type: Error.BadRequest, message: msg });

export const notFound = (msg: string): Either<never, HttpError> =>
    fail({ type: Error.NotFound, message: msg });

export const internalServer = (msg: string): Either<never, HttpError> =>
    fail({ type: Error.InternalServer, message: msg });

export const forbidden = (msg: string): Either<never, HttpError> =>
    fail({ type: Error.Forbidden, message: msg });

export const unauthorized = (msg: string): Either<never, HttpError> =>
    fail({ type: Error.Unauthorized, message: msg });

export const mapToPresentationResult = <T>(result: Result<T, HttpError>) => {
    if (result.isSuccess) {
        return result.value;
    }

    throw mapHttpErrorToException(result.error);
}

export const mapHttpErrorToException = (error: HttpError): HttpException => {
  switch (error.type) {
    case Error.BadRequest:
      return new BadRequestException(error.message);
    case Error.Unauthorized:
      return new UnauthorizedException(error.message);
    case Error.Forbidden:
      return new ForbiddenException(error.message);
    case Error.NotFound:
      return new NotFoundException(error.message);
    case Error.InternalServer:
    default:
      return new InternalServerErrorException(error.message);
  }
}