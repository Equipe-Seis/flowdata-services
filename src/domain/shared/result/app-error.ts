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

	private constructor(
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
		console.log('Unauthorized');
		return new AppError(message, AppErrorType.Unauthorized);
	}
}