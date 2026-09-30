import type { ApiErrorCode, ApiErrorDto } from '@mbst/contracts';
import type { Logger } from '../../application/ports/logger';
import {
  CatalogUnavailableError,
  InvalidProductQueryError,
  ProductNotFoundError,
} from '../../domain/errors';

export interface ErrorResponse {
  readonly status: number;
  readonly body: ApiErrorDto;
}

function response(status: number, error: ApiErrorCode, message: string): ErrorResponse {
  return { status, body: { error, message } };
}

/**
 * Maps any error to a status and a public body (error model in
 * docs/architecture.md). Bodies are generic on purpose: upstream details,
 * including anything about the API key, stay in the server log.
 */
export function toErrorResponse(error: unknown, logger: Logger): ErrorResponse {
  if (error instanceof InvalidProductQueryError) {
    return response(400, 'INVALID_QUERY', error.message);
  }
  if (error instanceof ProductNotFoundError) {
    return response(404, 'NOT_FOUND', 'Product not found.');
  }
  if (error instanceof CatalogUnavailableError) {
    if (error.reason === 'unauthorized') {
      logger.error('The catalog API rejected our API key; check CATALOG_API_KEY', {
        reason: error.reason,
      });
    } else {
      logger.warn('The catalog API could not answer', { reason: error.reason });
    }
    return error.reason === 'timeout'
      ? response(504, 'UPSTREAM_TIMEOUT', 'The catalog took too long to answer. Try again.')
      : response(502, 'UPSTREAM_ERROR', 'The catalog is not available right now. Try again.');
  }
  logger.error('Unexpected error while handling a request', {
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
  });
  return response(500, 'INTERNAL_ERROR', 'Something went wrong. Try again.');
}
