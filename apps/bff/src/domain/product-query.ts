import { InvalidProductQueryError } from './errors';

/** The challenge lists "the first 20 phones"; search results use the same size. */
export const DEFAULT_PRODUCT_LIMIT = 20;
export const MAX_PRODUCT_LIMIT = 50;
export const MAX_SEARCH_TERM_LENGTH = 100;

/** What to list: an optional search term (matched against brand or name) and a limit. */
export interface ProductQuery {
  readonly searchTerm?: string;
  readonly limit: number;
}

export interface ProductQueryInput {
  readonly searchTerm?: string | undefined;
  readonly limit?: number | undefined;
}

/** Normalizes raw input into a valid query, or throws InvalidProductQueryError. */
export function createProductQuery(input: ProductQueryInput): ProductQuery {
  const limit = input.limit ?? DEFAULT_PRODUCT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PRODUCT_LIMIT) {
    throw new InvalidProductQueryError(
      'limit',
      `limit must be a whole number from 1 to ${MAX_PRODUCT_LIMIT}.`,
    );
  }

  const searchTerm = input.searchTerm?.trim() ?? '';
  if (searchTerm.length > MAX_SEARCH_TERM_LENGTH) {
    throw new InvalidProductQueryError(
      'searchTerm',
      `The search term must be at most ${MAX_SEARCH_TERM_LENGTH} characters.`,
    );
  }

  return searchTerm === '' ? { limit } : { searchTerm, limit };
}
