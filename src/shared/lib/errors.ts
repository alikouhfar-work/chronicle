export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(message: string, opts?: { code?: string; status?: number; retryable?: boolean; cause?: unknown }) {
    super(message);
    this.name = this.constructor.name;
    this.code = opts?.code ?? 'APP_ERROR';
    this.status = opts?.status ?? 500;
    this.retryable = opts?.retryable ?? false;
    this.cause = opts?.cause;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, opts?: { cause?: unknown }) {
    super(message, { ...opts, code: 'VALIDATION_ERROR', status: 400, retryable: false });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, { code: 'NOT_FOUND', status: 404, retryable: false });
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', opts?: { cause?: unknown; retryable?: boolean }) {
    super(message, {
      code: 'DATABASE_ERROR',
      status: 503,
      retryable: opts?.retryable ?? true,
      cause: opts?.cause,
    });
  }
}

export class ExternalServiceError extends AppError {
  readonly service: string;
  constructor(service: string, message = 'External service failed', opts?: { cause?: unknown; retryable?: boolean; status?: number }) {
    super(`${service}: ${message}`, {
      code: 'EXTERNAL_SERVICE_ERROR',
      status: opts?.status ?? 502,
      retryable: opts?.retryable ?? true,
      cause: opts?.cause,
    });
    this.service = service;
  }
}

export const toAppError = (error: unknown, fallbackMessage = 'Unexpected error'): AppError => {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    // Prisma errors: P2002 unique constraint, P2025 not found, connection issues
    const code = (error as { code?: string }).code;
    if (typeof code === 'string' && code.startsWith('P')) {
      if (code === 'P2025') return new NotFoundError(error.message);
      return new DatabaseError(error.message, { cause: error });
    }
    return new AppError(error.message || fallbackMessage, { cause: error });
  }
  return new AppError(typeof error === 'string' ? error : fallbackMessage, { cause: error });
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
};
