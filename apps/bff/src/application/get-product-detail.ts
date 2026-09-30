import { ProductNotFoundError } from '../domain/errors';
import type { ProductDetail, ProductSummary } from '../domain/product';
import type { FeatureFlagsPort } from './ports/feature-flags-port';
import type { ProductCatalogPort } from './ports/product-catalog-port';

/** A product detail as served: similar products are absent when the flag is off. */
export type ProductDetailResult = Omit<ProductDetail, 'similarProducts'> & {
  readonly similarProducts?: readonly ProductSummary[];
};

export class GetProductDetail {
  readonly #catalog: ProductCatalogPort;
  readonly #flags: FeatureFlagsPort;

  constructor(catalog: ProductCatalogPort, flags: FeatureFlagsPort) {
    this.#catalog = catalog;
    this.#flags = flags;
  }

  async execute(productId: string): Promise<ProductDetailResult> {
    if (productId.trim() === '') {
      throw new ProductNotFoundError(productId);
    }

    const product = await this.#catalog.getById(productId);
    if (product === null) {
      throw new ProductNotFoundError(productId);
    }

    if (this.#flags.isEnabled('similar-products')) {
      return product;
    }
    const { similarProducts: _hidden, ...withoutSimilarProducts } = product;
    return withoutSimilarProducts;
  }
}
