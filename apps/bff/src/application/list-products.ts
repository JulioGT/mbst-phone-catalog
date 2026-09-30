import type { ProductSummary } from '../domain/product';
import { createProductQuery, type ProductQueryInput } from '../domain/product-query';
import type { ProductCatalogPort } from './ports/product-catalog-port';

/** Lists the catalog, optionally filtered by a search term matched against brand or name. */
export class ListProducts {
  readonly #catalog: ProductCatalogPort;

  constructor(catalog: ProductCatalogPort) {
    this.#catalog = catalog;
  }

  async execute(input: ProductQueryInput = {}): Promise<readonly ProductSummary[]> {
    const query = createProductQuery(input);
    const products = await this.#catalog.list(query);
    // The limit is our promise to the UI, so it holds even if the catalog ignores it.
    return products.slice(0, query.limit);
  }
}
