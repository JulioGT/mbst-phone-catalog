import type { z } from 'zod';
import type { Logger } from '../../application/ports/logger';
import type { ProductCatalogPort } from '../../application/ports/product-catalog-port';
import { CatalogUnavailableError } from '../../domain/errors';
import { moneyFromEuros } from '../../domain/money';
import type { ProductDetail, ProductSummary, Specifications } from '../../domain/product';
import type { ProductQuery } from '../../domain/product-query';
import {
  type UpstreamProductDetail,
  type UpstreamProductSummary,
  upstreamProductDetailSchema,
  upstreamProductListSchema,
} from './upstream-schemas';

export interface HttpProductCatalogOptions {
  /** Base URL of the remote API, without a trailing slash. */
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  readonly logger: Logger;
  readonly fetch?: typeof fetch;
}

/**
 * The remote list can contain the same product twice. Asking for a few more
 * than needed means removing duplicates still leaves `limit` products.
 */
export const DUPLICATE_HEADROOM = 5;

const NOT_FOUND = Symbol('not found');

/**
 * The remote catalog API behind ProductCatalogPort. Every quirk of that API is
 * absorbed here (docs/api-contract.md): `http` image URLs, decimal prices,
 * duplicates, missing specs, and its status codes.
 */
export class HttpProductCatalog implements ProductCatalogPort {
  readonly #baseUrl: string;
  readonly #apiKey: string;
  readonly #timeoutMs: number;
  readonly #logger: Logger;
  readonly #fetch: typeof fetch;

  constructor(options: HttpProductCatalogOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.#apiKey = options.apiKey;
    this.#timeoutMs = options.timeoutMs;
    this.#logger = options.logger;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  async list(query: ProductQuery): Promise<readonly ProductSummary[]> {
    const params = new URLSearchParams({ limit: String(query.limit + DUPLICATE_HEADROOM) });
    if (query.searchTerm !== undefined) {
      params.set('search', query.searchTerm);
    }
    const path = `/products?${params.toString()}`;

    const body = await this.#get(path);
    if (body === NOT_FOUND) {
      throw new CatalogUnavailableError('unreachable');
    }
    const products = this.#parse(upstreamProductListSchema, body, '/products');
    const unique = this.#withoutDuplicates(products.map(toProductSummary), '/products');
    return unique.slice(0, query.limit);
  }

  async getById(productId: string): Promise<ProductDetail | null> {
    const body = await this.#get(`/products/${encodeURIComponent(productId)}`);
    if (body === NOT_FOUND) {
      return null;
    }
    const product = this.#parse(upstreamProductDetailSchema, body, '/products/:id');
    return {
      ...toProductDetail(product),
      similarProducts: this.#withoutDuplicates(
        product.similarProducts.map(toProductSummary),
        '/products/:id similarProducts',
      ),
    };
  }

  async #get(path: string): Promise<unknown> {
    const signal = AbortSignal.timeout(this.#timeoutMs);
    try {
      const response = await this.#fetch(`${this.#baseUrl}${path}`, {
        headers: { 'x-api-key': this.#apiKey, accept: 'application/json' },
        signal,
      });
      if (response.status === 404) {
        return NOT_FOUND;
      }
      if (response.status === 401 || response.status === 403) {
        throw new CatalogUnavailableError('unauthorized');
      }
      if (!response.ok) {
        throw new CatalogUnavailableError('unreachable');
      }
      return await readJson(response);
    } catch (error) {
      if (error instanceof CatalogUnavailableError) {
        throw error;
      }
      throw new CatalogUnavailableError(signal.aborted ? 'timeout' : 'unreachable', {
        cause: error,
      });
    }
  }

  #parse<Schema extends z.ZodType>(
    schema: Schema,
    body: unknown,
    endpoint: string,
  ): z.output<Schema> {
    const result = schema.safeParse(body);
    if (!result.success) {
      this.#logger.warn('Upstream response failed validation', {
        endpoint,
        issues: result.error.issues
          .slice(0, 5)
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; '),
      });
      throw new CatalogUnavailableError('invalid-response', { cause: result.error });
    }
    return result.data;
  }

  #withoutDuplicates(products: readonly ProductSummary[], endpoint: string): ProductSummary[] {
    const seen = new Set<string>();
    const unique = products.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
    if (unique.length < products.length) {
      this.#logger.warn('Upstream returned duplicate products; kept the first of each', {
        endpoint,
        duplicates: products.length - unique.length,
      });
    }
    return unique;
  }
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new CatalogUnavailableError('invalid-response', { cause: error });
  }
}

/** The host serves the same images over https; http would cause mixed-content warnings. */
function secureImageUrl(url: string): string {
  return url.replace(/^http:\/\//i, 'https://');
}

function toProductSummary(product: UpstreamProductSummary): ProductSummary {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    basePrice: moneyFromEuros(product.basePrice),
    imageUrl: secureImageUrl(product.imageUrl),
  };
}

function toSpecifications(specs: UpstreamProductDetail['specs']): Specifications {
  // Copy only the attributes that are present (exactOptionalPropertyTypes).
  return Object.fromEntries(
    Object.entries(specs).filter(([, value]) => value !== undefined),
  ) as Specifications;
}

function toProductDetail(product: UpstreamProductDetail): Omit<ProductDetail, 'similarProducts'> {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    description: product.description,
    basePrice: moneyFromEuros(product.basePrice),
    specs: toSpecifications(product.specs),
    colorOptions: product.colorOptions.map((color) => ({
      name: color.name,
      hexCode: color.hexCode,
      imageUrl: secureImageUrl(color.imageUrl),
    })),
    storageOptions: product.storageOptions.map((storage) => ({
      capacity: storage.capacity,
      price: moneyFromEuros(storage.price),
    })),
  };
}
