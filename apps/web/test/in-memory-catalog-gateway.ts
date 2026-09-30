import type { CatalogGateway, SearchOptions } from '../src/application/ports/catalog-gateway';
import { CatalogUnavailableError } from '../src/domain/errors';
import type { ProductDetail, ProductSummary } from '../src/domain/product';

/**
 * Catalog for tests. Search mirrors the API (case-insensitive match on brand or
 * name, first 20). `failNext` makes the next call fail; `searches` records the
 * terms asked for.
 */
export class InMemoryCatalogGateway implements CatalogGateway {
  readonly searches: string[] = [];
  #failuresLeft = 0;

  readonly #products: readonly ProductSummary[];
  readonly #details: readonly ProductDetail[];

  constructor(products: readonly ProductSummary[] = [], details: readonly ProductDetail[] = []) {
    this.#products = products;
    this.#details = details;
  }

  failNext(times = 1): void {
    this.#failuresLeft = times;
  }

  async searchProducts(
    searchTerm: string,
    _options?: SearchOptions,
  ): Promise<readonly ProductSummary[]> {
    this.searches.push(searchTerm);
    if (this.#failuresLeft > 0) {
      this.#failuresLeft -= 1;
      throw new CatalogUnavailableError('Simulated outage.');
    }
    const term = searchTerm.trim().toLowerCase();
    return this.#products
      .filter(
        (product) => term === '' || `${product.brand} ${product.name}`.toLowerCase().includes(term),
      )
      .slice(0, 20);
  }

  async getProduct(productId: string, _options?: SearchOptions): Promise<ProductDetail | null> {
    if (this.#failuresLeft > 0) {
      this.#failuresLeft -= 1;
      throw new CatalogUnavailableError('Simulated outage.');
    }
    return this.#details.find((product) => product.id === productId) ?? null;
  }
}
