/**
 * The catalog could not be read: network failure, BFF or upstream error, or a
 * response that breaks the contract. The UI shows a retry, never the details.
 */
export class CatalogUnavailableError extends Error {
  override readonly name = 'CatalogUnavailableError';
}
