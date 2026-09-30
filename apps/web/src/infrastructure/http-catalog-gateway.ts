import {
  API_PATHS,
  type ProductDetailDto,
  type ProductSummaryDto,
  productDetailDtoSchema,
  productListDtoSchema,
} from '@mbst/contracts';
import type { CatalogGateway, SearchOptions } from '../application/ports/catalog-gateway';
import { CatalogUnavailableError } from '../domain/errors';
import { moneyFromCents } from '../domain/money';
import type { ProductDetail, ProductSummary } from '../domain/product';

export interface HttpCatalogGatewayOptions {
  /** Empty in the browser (same origin); an absolute URL when rendering on the server. */
  readonly baseUrl?: string;
  readonly fetch?: typeof fetch;
}

/**
 * Talks to the BFF. Responses are validated against the shared contract and
 * mapped to the web domain here, so components never see wire formats.
 */
export class HttpCatalogGateway implements CatalogGateway {
  readonly #baseUrl: string;
  readonly #fetch: typeof fetch;

  constructor({ baseUrl = '', fetch: fetchImpl }: HttpCatalogGatewayOptions = {}) {
    this.#baseUrl = baseUrl;
    this.#fetch = fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
  }

  async searchProducts(
    searchTerm: string,
    { signal }: SearchOptions = {},
  ): Promise<readonly ProductSummary[]> {
    const term = searchTerm.trim();
    const query = term === '' ? '' : `?${new URLSearchParams({ search: term }).toString()}`;
    const body = await this.#getJson(`${API_PATHS.products}${query}`, signal);

    const products = productListDtoSchema.safeParse(body);
    if (!products.success) {
      throw new CatalogUnavailableError('The catalog answered in an unexpected format.', {
        cause: products.error,
      });
    }
    return products.data.map(toProductSummary);
  }

  async getProduct(
    productId: string,
    { signal }: SearchOptions = {},
  ): Promise<ProductDetail | null> {
    const body = await this.#getJson(API_PATHS.product(productId), signal, {
      notFoundAsNull: true,
    });
    if (body === null) {
      return null;
    }
    const product = productDetailDtoSchema.safeParse(body);
    if (!product.success) {
      throw new CatalogUnavailableError('The catalog answered in an unexpected format.', {
        cause: product.error,
      });
    }
    return toProductDetail(product.data);
  }

  async #getJson(
    path: string,
    signal: AbortSignal | undefined,
    { notFoundAsNull = false } = {},
  ): Promise<unknown> {
    let response: Response;
    try {
      response = await this.#fetch(`${this.#baseUrl}${path}`, {
        headers: { accept: 'application/json' },
        ...(signal === undefined ? {} : { signal }),
      });
    } catch (error) {
      if (signal?.aborted) {
        throw signal.reason;
      }
      throw new CatalogUnavailableError('The catalog could not be reached.', { cause: error });
    }
    if (response.status === 404 && notFoundAsNull) {
      return null;
    }
    if (!response.ok) {
      throw new CatalogUnavailableError(`The catalog answered ${response.status}.`);
    }
    try {
      return await response.json();
    } catch (error) {
      if (signal?.aborted) {
        throw signal.reason;
      }
      throw new CatalogUnavailableError('The catalog answered with invalid JSON.', {
        cause: error,
      });
    }
  }
}

function toProductSummary(product: ProductSummaryDto): ProductSummary {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    basePrice: moneyFromCents(product.basePriceInCents),
    imageUrl: product.imageUrl,
  };
}

function toProductDetail(product: ProductDetailDto): ProductDetail {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    description: product.description,
    basePrice: moneyFromCents(product.basePriceInCents),
    specs: Object.fromEntries(
      Object.entries(product.specs).filter(([, value]) => value !== undefined),
    ),
    colorOptions: product.colorOptions.map((color) => ({ ...color })),
    storageOptions: product.storageOptions.map((storage) => ({
      capacity: storage.capacity,
      price: moneyFromCents(storage.priceInCents),
    })),
    ...(product.similarProducts === undefined
      ? {}
      : { similarProducts: product.similarProducts.map(toProductSummary) }),
  };
}
