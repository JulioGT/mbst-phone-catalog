import { expect } from 'chai';
import { CatalogUnavailableError } from '../../src/domain/errors';
import {
  DUPLICATE_HEADROOM,
  HttpProductCatalog,
} from '../../src/infrastructure/catalog/http-product-catalog';
import { rejectionOf } from '../builders';
import { InMemoryLogger } from '../doubles/in-memory-logger';
import { json, type StubServer, startStubServer } from '../support/stub-server';
import { anUpstreamDetail, anUpstreamSummary } from '../support/upstream-fixtures';

describe('HttpProductCatalog', () => {
  let upstream: StubServer;
  let logger: InMemoryLogger;
  let catalog: HttpProductCatalog;

  before(async () => {
    upstream = await startStubServer();
  });

  after(() => upstream.close());

  beforeEach(() => {
    upstream.requests.length = 0;
    logger = new InMemoryLogger();
    catalog = new HttpProductCatalog({
      baseUrl: `${upstream.baseUrl}/`,
      apiKey: 'test-key',
      timeoutMs: 200,
      logger,
    });
  });

  async function reasonOf(promise: Promise<unknown>) {
    const error = await rejectionOf(promise);
    expect(error).to.be.instanceOf(CatalogUnavailableError);
    return (error as CatalogUnavailableError).reason;
  }

  describe('list', () => {
    it('sends the API key, the search term and a limit with headroom for duplicates', async () => {
      upstream.handle(json(200, []));

      await catalog.list({ searchTerm: 'galaxy s24', limit: 20 });

      const [request] = upstream.requests;
      expect(request?.apiKey).to.equal('test-key');
      const url = new URL(request?.url ?? '', upstream.baseUrl);
      expect(url.pathname).to.equal('/products');
      expect(url.searchParams.get('search')).to.equal('galaxy s24');
      expect(url.searchParams.get('limit')).to.equal(String(20 + DUPLICATE_HEADROOM));
    });

    it('does not send a search parameter when there is no search term', async () => {
      upstream.handle(json(200, []));

      await catalog.list({ limit: 20 });

      const url = new URL(upstream.requests[0]?.url ?? '', upstream.baseUrl);
      expect(url.searchParams.has('search')).to.equal(false);
    });

    it('converts decimal prices to cents and image URLs to https', async () => {
      upstream.handle(json(200, [anUpstreamSummary({ id: 'XMI-13TPro', basePrice: 553.31 })]));

      const [product] = await catalog.list({ limit: 20 });

      expect(product?.basePrice).to.equal(55331);
      expect(product?.imageUrl).to.equal(
        'https://catalog.test/images/SMG-S24U-titanium-violet.webp',
      );
    });

    it('drops duplicate products, keeps the first, and still fills the limit', async () => {
      upstream.handle(
        json(200, [
          anUpstreamSummary({ id: 'A' }),
          anUpstreamSummary({ id: 'B', name: 'first B' }),
          anUpstreamSummary({ id: 'B', name: 'second B' }),
          anUpstreamSummary({ id: 'C' }),
        ]),
      );

      const products = await catalog.list({ limit: 3 });

      expect(products.map((product) => product.id)).to.deep.equal(['A', 'B', 'C']);
      expect(products[1]?.name).to.equal('first B');
      expect(logger.entries.map((entry) => entry.level)).to.deep.equal(['warn']);
    });

    it('returns no more than the limit', async () => {
      upstream.handle(
        json(
          200,
          ['A', 'B', 'C'].map((id) => anUpstreamSummary({ id })),
        ),
      );

      expect(await catalog.list({ limit: 2 })).to.have.length(2);
    });
  });

  describe('getById', () => {
    it('maps a product detail into the domain', async () => {
      upstream.handle(json(200, anUpstreamDetail()));

      const product = await catalog.getById('SMG-S24U');

      expect(product).to.deep.include({ id: 'SMG-S24U', basePrice: 132900 });
      expect(product?.storageOptions).to.deep.equal([
        { capacity: '256 GB', price: 122900 },
        { capacity: '512 GB', price: 132900 },
      ]);
      expect(product?.colorOptions[0]?.imageUrl).to.match(/^https:\/\//);
      expect(product?.similarProducts[0]?.imageUrl).to.match(/^https:\/\//);
      expect(product).not.to.have.property('rating');
    });

    it('URL-encodes the product id', async () => {
      upstream.handle(json(404, { error: 'NOT-FOUND', message: 'Product not found' }));

      await catalog.getById('a/b c');

      expect(upstream.requests[0]?.url).to.equal('/products/a%2Fb%20c');
    });

    it('resolves to null when the API answers 404', async () => {
      upstream.handle(json(404, { error: 'NOT-FOUND', message: 'Product not found' }));

      expect(await catalog.getById('NOPE-404')).to.equal(null);
    });

    it('accepts missing spec attributes and ignores unknown ones', async () => {
      upstream.handle(
        json(200, anUpstreamDetail({ specs: { screen: '6.1"', storage: '128 GB' } })),
      );

      const product = await catalog.getById('APL-IP13-128');

      expect(product?.specs).to.deep.equal({ screen: '6.1"' });
    });

    it('accepts short hex color codes', async () => {
      upstream.handle(
        json(
          200,
          anUpstreamDetail({
            colorOptions: [
              { name: 'Negro', hexCode: '#000', imageUrl: 'http://catalog.test/x.webp' },
            ],
          }),
        ),
      );

      expect((await catalog.getById('SNY-XPERIA1V'))?.colorOptions[0]?.hexCode).to.equal('#000');
    });

    it('drops duplicate similar products', async () => {
      const similar = anUpstreamSummary({ id: 'SMG-A15' });
      upstream.handle(json(200, anUpstreamDetail({ similarProducts: [similar, similar] })));

      expect((await catalog.getById('OPP-R11F'))?.similarProducts).to.have.length(1);
    });

    it('treats missing similar products as none', async () => {
      const { similarProducts: _omitted, ...withoutSimilar } = anUpstreamDetail();
      upstream.handle(json(200, withoutSimilar));

      expect((await catalog.getById('SMG-S24U'))?.similarProducts).to.deep.equal([]);
    });
  });

  describe('failures', () => {
    it('reports a rejected API key as unauthorized', async () => {
      upstream.handle(json(401, { error: 'UNAUTHORIZED', message: 'Invalid API key' }));

      expect(await reasonOf(catalog.list({ limit: 20 }))).to.equal('unauthorized');
    });

    it('reports a server error as unreachable', async () => {
      upstream.handle(json(500, { error: 'boom' }));

      expect(await reasonOf(catalog.getById('SMG-S24U'))).to.equal('unreachable');
    });

    it('reports a slow answer as a timeout', async () => {
      upstream.handle((_request, response) => {
        setTimeout(() => response.writeHead(200).end('[]'), 1000).unref();
      });

      expect(await reasonOf(catalog.list({ limit: 20 }))).to.equal('timeout');
    });

    it('reports a connection failure as unreachable', async () => {
      const offline = new HttpProductCatalog({
        baseUrl: 'http://127.0.0.1:1',
        apiKey: 'test-key',
        timeoutMs: 1000,
        logger,
      });

      expect(await reasonOf(offline.list({ limit: 20 }))).to.equal('unreachable');
    });

    it('rejects a body that is not JSON', async () => {
      upstream.handle((_request, response) => {
        response.writeHead(200, { 'content-type': 'text/html' }).end('<html>maintenance</html>');
      });

      expect(await reasonOf(catalog.list({ limit: 20 }))).to.equal('invalid-response');
    });

    it('rejects a payload that does not match the expected shape, and logs where', async () => {
      upstream.handle(json(200, [anUpstreamSummary({ basePrice: 'cheap' })]));

      expect(await reasonOf(catalog.list({ limit: 20 }))).to.equal('invalid-response');
      expect(logger.entries[0]?.fields.issues).to.match(/^0\.basePrice/);
    });
  });
});
