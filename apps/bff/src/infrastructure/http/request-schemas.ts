import { z } from 'zod';
import { InvalidProductQueryError } from '../../domain/errors';
import type { ProductQueryInput } from '../../domain/product-query';

/**
 * Shape of `GET /api/products` query strings. Values arrive as strings, or as
 * arrays when a key is repeated. Only the shape is checked here; business
 * ranges (limit 1..50, search length) are domain rules (`createProductQuery`).
 */
const listQuerySchema = z.object({
  search: z.string().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .optional(),
});

/** Turns a raw query string into use-case input, or throws InvalidProductQueryError. */
export function parseListQuery(query: unknown): ProductQueryInput {
  const result = listQuerySchema.safeParse(query);
  if (!result.success) {
    const field = result.error.issues[0]?.path[0] === 'limit' ? 'limit' : 'searchTerm';
    throw new InvalidProductQueryError(
      field,
      field === 'limit'
        ? 'limit must be a whole number.'
        : 'search must be given at most once, as text.',
    );
  }
  return { searchTerm: result.data.search, limit: result.data.limit };
}
