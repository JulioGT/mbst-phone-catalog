import { expect } from 'chai';
import { ListProducts } from '../../src/application/list-products';
import type { ProductCatalogPort } from '../../src/application/ports/product-catalog-port';
import { CatalogUnavailableError, InvalidProductQueryError } from '../../src/domain/errors';
import type { ProductQuery } from '../../src/domain/product-query';
import { aProductSummary, rejectionOf } from '../builders';
import { InMemoryProductCatalog } from '../doubles/in-memory-product-catalog';

const iphone = aProductSummary({ id: 'APL-IP13-128', brand: 'Apple', name: 'iPhone 13' });
const galaxy = aProductSummary({ id: 'SMG-S24', brand: 'Samsung', name: 'Galaxy S24' });
const redmi = aProductSummary({ id: 'XMI-RN13', brand: 'XIAOMI', name: 'Redmi Note 13' });

function catalogReturning(products: readonly ReturnType<typeof aProductSummary>[]) {
  const queries: ProductQuery[] = [];
  const catalog: ProductCatalogPort = {
    list: async (query) => {
      queries.push(query);
      return products;
    },
    getById: async () => null,
  };
  return { catalog, queries };
}

describe('ListProducts', () => {
  it('lists the catalog when there is no search term', async () => {
    const listProducts = new ListProducts(
      new InMemoryProductCatalog({ summaries: [iphone, galaxy, redmi] }),
    );

    const products = await listProducts.execute();

    expect(products).to.deep.equal([iphone, galaxy, redmi]);
  });

  it('asks the catalog for the first 20 products by default', async () => {
    const { catalog, queries } = catalogReturning([]);

    await new ListProducts(catalog).execute();

    expect(queries).to.deep.equal([{ limit: 20 }]);
  });

  it('filters by brand or name through the catalog', async () => {
    const listProducts = new ListProducts(
      new InMemoryProductCatalog({ summaries: [iphone, galaxy, redmi] }),
    );

    expect(await listProducts.execute({ searchTerm: 'xiaomi' })).to.deep.equal([redmi]);
    expect(await listProducts.execute({ searchTerm: 'galaxy' })).to.deep.equal([galaxy]);
  });

  it('sends the trimmed search term to the catalog', async () => {
    const { catalog, queries } = catalogReturning([]);

    await new ListProducts(catalog).execute({ searchTerm: '  iphone  ' });

    expect(queries).to.deep.equal([{ searchTerm: 'iphone', limit: 20 }]);
  });

  it('returns an empty list when nothing matches', async () => {
    const listProducts = new ListProducts(new InMemoryProductCatalog({ summaries: [iphone] }));

    expect(await listProducts.execute({ searchTerm: 'nokia' })).to.deep.equal([]);
  });

  it('never returns more products than the limit, even if the catalog does', async () => {
    const tooMany = Array.from({ length: 25 }, (_, index) =>
      aProductSummary({ id: `PHONE-${index}` }),
    );
    const { catalog } = catalogReturning(tooMany);

    const products = await new ListProducts(catalog).execute();

    expect(products).to.have.length(20);
    expect(products[0]?.id).to.equal('PHONE-0');
  });

  it('rejects an invalid query without calling the catalog', async () => {
    const { catalog, queries } = catalogReturning([]);

    const error = await rejectionOf(new ListProducts(catalog).execute({ limit: 0 }));

    expect(error).to.be.instanceOf(InvalidProductQueryError);
    expect(queries).to.be.empty;
  });

  it('lets a catalog outage reach the caller', async () => {
    const outage = new CatalogUnavailableError('timeout');
    const catalog: ProductCatalogPort = {
      list: () => Promise.reject(outage),
      getById: async () => null,
    };

    expect(await rejectionOf(new ListProducts(catalog).execute())).to.equal(outage);
  });
});
