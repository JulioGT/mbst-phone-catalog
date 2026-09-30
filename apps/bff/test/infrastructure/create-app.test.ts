import { apiErrorDtoSchema, productDetailDtoSchema, productListDtoSchema } from '@mbst/contracts';
import { expect } from 'chai';
import request from 'supertest';
import { GetProductDetail } from '../../src/application/get-product-detail';
import { ListProducts } from '../../src/application/list-products';
import type { ProductCatalogPort } from '../../src/application/ports/product-catalog-port';
import { CatalogUnavailableError } from '../../src/domain/errors';
import type { FeatureFlag } from '../../src/domain/feature-flag';
import { moneyFromCents } from '../../src/domain/money';
import { InMemoryProductCatalog } from '../../src/infrastructure/catalog/in-memory-product-catalog';
import { InMemoryFeatureFlags } from '../../src/infrastructure/flags/in-memory-feature-flags';
import { createApp } from '../../src/infrastructure/http/create-app';
import { InMemoryLogger } from '../../src/infrastructure/logging/in-memory-logger';
import { aProductDetail, aProductSummary } from '../builders';

const iphone = aProductSummary({ id: 'APL-IP13-128', brand: 'Apple', name: 'iPhone 13' });
const galaxy = aProductSummary({ id: 'SMG-S24', brand: 'Samsung', name: 'Galaxy S24' });
const edge = aProductDetail({
  id: 'MTE-EDGE50PRO',
  storageOptions: [{ capacity: '512 GB', price: moneyFromCents(64900) }],
});

function appWith({
  catalog = new InMemoryProductCatalog({ summaries: [iphone, galaxy], details: [edge] }),
  flags = ['similar-products'],
  logger = new InMemoryLogger(),
}: {
  catalog?: ProductCatalogPort;
  flags?: FeatureFlag[];
  logger?: InMemoryLogger;
} = {}) {
  return createApp({
    listProducts: new ListProducts(catalog),
    getProductDetail: new GetProductDetail(catalog, new InMemoryFeatureFlags(flags)),
    logger,
  });
}

function failingCatalog(reason: CatalogUnavailableError['reason']): ProductCatalogPort {
  return {
    list: () => Promise.reject(new CatalogUnavailableError(reason)),
    getById: () => Promise.reject(new CatalogUnavailableError(reason)),
  };
}

describe('BFF HTTP API', () => {
  describe('GET /api/products', () => {
    it('lists products in the contract format, with prices in cents', async () => {
      const response = await request(appWith()).get('/api/products').expect(200);

      const products = productListDtoSchema.parse(response.body);
      expect(products.map((product) => product.id)).to.deep.equal(['APL-IP13-128', 'SMG-S24']);
      expect(products[0]?.basePriceInCents).to.equal(61900);
    });

    it('filters by the search term', async () => {
      const response = await request(appWith()).get('/api/products?search=samsung').expect(200);

      expect(response.body).to.have.length(1);
      expect(response.body[0].id).to.equal('SMG-S24');
    });

    it('answers an empty list when nothing matches', async () => {
      const response = await request(appWith()).get('/api/products?search=nokia').expect(200);

      expect(response.body).to.deep.equal([]);
    });

    for (const query of ['limit=abc', 'limit=0', 'limit=51', 'limit=-1', 'search=a&search=b']) {
      it(`rejects ?${query} with 400`, async () => {
        const response = await request(appWith()).get(`/api/products?${query}`).expect(400);

        expect(apiErrorDtoSchema.parse(response.body).error).to.equal('INVALID_QUERY');
      });
    }
  });

  describe('GET /api/products/:productId', () => {
    it('returns the product detail in the contract format', async () => {
      const response = await request(appWith()).get('/api/products/MTE-EDGE50PRO').expect(200);

      const product = productDetailDtoSchema.parse(response.body);
      expect(product.storageOptions).to.deep.equal([{ capacity: '512 GB', priceInCents: 64900 }]);
      expect(product.similarProducts).to.have.length(1);
    });

    it('leaves out similarProducts when the similar-products flag is off', async () => {
      const response = await request(appWith({ flags: [] }))
        .get('/api/products/MTE-EDGE50PRO')
        .expect(200);

      expect(response.body).not.to.have.property('similarProducts');
    });

    it('answers 404 for an unknown product', async () => {
      const response = await request(appWith()).get('/api/products/NOPE-404').expect(404);

      expect(response.body).to.deep.equal({ error: 'NOT_FOUND', message: 'Product not found.' });
    });
  });

  describe('catalog failures', () => {
    it('answers 504 when the catalog times out', async () => {
      const response = await request(appWith({ catalog: failingCatalog('timeout') }))
        .get('/api/products')
        .expect(504);

      expect(response.body.error).to.equal('UPSTREAM_TIMEOUT');
    });

    for (const reason of ['unreachable', 'invalid-response'] as const) {
      it(`answers 502 when the catalog is ${reason}`, async () => {
        const response = await request(appWith({ catalog: failingCatalog(reason) }))
          .get('/api/products/MTE-EDGE50PRO')
          .expect(502);

        expect(response.body.error).to.equal('UPSTREAM_ERROR');
      });
    }

    it('answers 502 for a rejected API key, logs it as an error, and reveals nothing', async () => {
      const logger = new InMemoryLogger();

      const response = await request(appWith({ catalog: failingCatalog('unauthorized'), logger }))
        .get('/api/products')
        .expect(502);

      expect(response.body.error).to.equal('UPSTREAM_ERROR');
      expect(JSON.stringify(response.body)).not.to.match(/key|unauthori/i);
      expect(logger.entries.map((entry) => entry.level)).to.deep.equal(['error']);
    });

    it('answers 500 with a generic body for an unexpected error', async () => {
      const broken: ProductCatalogPort = {
        list: () => Promise.reject(new TypeError('cannot read properties of undefined')),
        getById: async () => null,
      };

      const response = await request(appWith({ catalog: broken }))
        .get('/api/products')
        .expect(500);

      expect(response.body).to.deep.equal({
        error: 'INTERNAL_ERROR',
        message: 'Something went wrong. Try again.',
      });
    });
  });

  describe('other routes', () => {
    it('reports health', async () => {
      const response = await request(appWith()).get('/health').expect(200);

      expect(response.body).to.deep.equal({ status: 'ok' });
    });

    it('answers unknown API routes with a JSON 404', async () => {
      const response = await request(appWith()).get('/api/nope').expect(404);

      expect(apiErrorDtoSchema.parse(response.body).error).to.equal('NOT_FOUND');
    });

    it('sets security headers and hides the framework', async () => {
      const response = await request(appWith()).get('/health');

      expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
      expect(response.headers).not.to.have.property('x-powered-by');
    });
  });
});
