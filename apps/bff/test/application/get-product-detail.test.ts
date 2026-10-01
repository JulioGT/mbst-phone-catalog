import { expect } from 'chai';
import { GetProductDetail } from '../../src/application/get-product-detail';
import type { ProductCatalogPort } from '../../src/application/ports/product-catalog-port';
import { CatalogUnavailableError, ProductNotFoundError } from '../../src/domain/errors';
import { aProductDetail, rejectionOf } from '../builders';
import { InMemoryFeatureFlags } from '../doubles/in-memory-feature-flags';
import { InMemoryProductCatalog } from '../doubles/in-memory-product-catalog';

const edge = aProductDetail({ id: 'MTE-EDGE50PRO' });
const catalog = new InMemoryProductCatalog({ details: [edge] });

describe('GetProductDetail', () => {
  it('returns the product with its similar products when the flag is on', async () => {
    const getProductDetail = new GetProductDetail(
      catalog,
      new InMemoryFeatureFlags(['similar-products']),
    );

    expect(await getProductDetail.execute('MTE-EDGE50PRO')).to.deep.equal(edge);
  });

  it('leaves out similar products entirely when the flag is off', async () => {
    const getProductDetail = new GetProductDetail(catalog, new InMemoryFeatureFlags([]));

    const product = await getProductDetail.execute('MTE-EDGE50PRO');

    expect(product).not.to.have.property('similarProducts');
    expect(product.name).to.equal('edge 50 Pro');
  });

  it('reports an unknown product as not found', async () => {
    const getProductDetail = new GetProductDetail(catalog, new InMemoryFeatureFlags());

    const error = await rejectionOf(getProductDetail.execute('NOPE-404'));

    expect(error).to.be.instanceOf(ProductNotFoundError);
    expect(error).to.have.property('productId', 'NOPE-404');
  });

  it('reports a blank id as not found without asking the catalog', async () => {
    let calls = 0;
    const countingCatalog: ProductCatalogPort = {
      list: async () => [],
      getById: async () => {
        calls += 1;
        return null;
      },
    };

    const error = await rejectionOf(
      new GetProductDetail(countingCatalog, new InMemoryFeatureFlags()).execute('  '),
    );

    expect(error).to.be.instanceOf(ProductNotFoundError);
    expect(calls).to.equal(0);
  });

  it('lets a catalog outage reach the caller', async () => {
    const outage = new CatalogUnavailableError('unreachable');
    const failingCatalog: ProductCatalogPort = {
      list: async () => [],
      getById: () => Promise.reject(outage),
    };

    const error = await rejectionOf(
      new GetProductDetail(failingCatalog, new InMemoryFeatureFlags()).execute('MTE-EDGE50PRO'),
    );

    expect(error).to.equal(outage);
  });
});
