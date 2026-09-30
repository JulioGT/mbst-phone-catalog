import type { ProductDetail, ProductSummary } from '../../domain/product';
import type { ProductQuery } from '../../domain/product-query';

/**
 * The product catalog, in domain terms. Implementations reject with
 * CatalogUnavailableError when the catalog cannot answer.
 */
export interface ProductCatalogPort {
  /** Products whose brand or name matches the search term, at most `query.limit` of them. */
  list(query: ProductQuery): Promise<readonly ProductSummary[]>;
  /** Resolves to null when no product has this id. */
  getById(productId: string): Promise<ProductDetail | null>;
}
