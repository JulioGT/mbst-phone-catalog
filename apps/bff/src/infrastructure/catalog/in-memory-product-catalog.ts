import type { ProductCatalogPort } from '../../application/ports/product-catalog-port';
import type { ProductDetail, ProductSummary } from '../../domain/product';
import type { ProductQuery } from '../../domain/product-query';

export interface InMemoryCatalogContents {
  readonly summaries?: readonly ProductSummary[];
  readonly details?: readonly ProductDetail[];
}

/**
 * A catalog held in memory, for tests and local work without the network.
 * Search mirrors the remote API: a case-insensitive match on brand or name.
 */
export class InMemoryProductCatalog implements ProductCatalogPort {
  readonly #summaries: readonly ProductSummary[];
  readonly #details: readonly ProductDetail[];

  constructor({ summaries = [], details = [] }: InMemoryCatalogContents = {}) {
    this.#summaries = summaries;
    this.#details = details;
  }

  async list(query: ProductQuery): Promise<readonly ProductSummary[]> {
    const term = query.searchTerm?.toLowerCase();
    const matches =
      term === undefined
        ? this.#summaries
        : this.#summaries.filter(
            (product) =>
              product.brand.toLowerCase().includes(term) ||
              product.name.toLowerCase().includes(term),
          );
    return matches.slice(0, query.limit);
  }

  async getById(productId: string): Promise<ProductDetail | null> {
    return this.#details.find((product) => product.id === productId) ?? null;
  }
}
