import type { ProductDetail, ProductSummary } from '../../domain/product';

export interface SearchOptions {
  /** Aborts the request when a newer search replaces it. */
  readonly signal?: AbortSignal;
}

/**
 * The product catalog as the web app sees it. Implementations reject with
 * CatalogUnavailableError on failure, or with the signal's reason when aborted.
 */
export interface CatalogGateway {
  /** The first products whose brand or name matches the term; all products when it is empty. */
  searchProducts(searchTerm: string, options?: SearchOptions): Promise<readonly ProductSummary[]>;
  /** One product, or null when no product has this id. */
  getProduct(productId: string, options?: SearchOptions): Promise<ProductDetail | null>;
}
