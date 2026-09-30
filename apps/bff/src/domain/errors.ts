export class ProductNotFoundError extends Error {
  override readonly name = 'ProductNotFoundError';
  readonly productId: string;

  constructor(productId: string) {
    super(`No product with id "${productId}" exists in the catalog.`);
    this.productId = productId;
  }
}

/**
 * Why the remote catalog could not answer. Callers map each reason to an HTTP
 * status (see the error model in docs/architecture.md); none of them is shown
 * to the shopper verbatim.
 */
export type CatalogUnavailableReason =
  | 'timeout'
  | 'unreachable'
  | 'unauthorized'
  | 'invalid-response';

export class CatalogUnavailableError extends Error {
  override readonly name = 'CatalogUnavailableError';
  readonly reason: CatalogUnavailableReason;

  constructor(reason: CatalogUnavailableReason, options?: { readonly cause?: unknown }) {
    super(`The product catalog is unavailable (${reason}).`, options);
    this.reason = reason;
  }
}

export type ProductQueryField = 'searchTerm' | 'limit';

export class InvalidProductQueryError extends Error {
  override readonly name = 'InvalidProductQueryError';
  readonly field: ProductQueryField;

  constructor(field: ProductQueryField, message: string) {
    super(message);
    this.field = field;
  }
}
