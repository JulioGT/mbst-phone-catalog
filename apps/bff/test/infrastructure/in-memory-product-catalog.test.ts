import { expect } from 'chai';
import { InMemoryProductCatalog } from '../../src/infrastructure/catalog/in-memory-product-catalog';
import { aProductDetail, aProductSummary } from '../builders';

const iphone = aProductSummary({ id: 'APL-IP13-128', brand: 'Apple', name: 'iPhone 13' });
const redmi = aProductSummary({ id: 'XMI-RN13', brand: 'XIAOMI', name: 'Redmi Note 13' });

describe('InMemoryProductCatalog', () => {
  const catalog = new InMemoryProductCatalog({
    summaries: [iphone, redmi],
    details: [aProductDetail({ id: 'XMI-RN13' })],
  });

  it('matches the search term against brand or name, ignoring case', async () => {
    expect(await catalog.list({ searchTerm: 'Xiaomi', limit: 20 })).to.deep.equal([redmi]);
    expect(await catalog.list({ searchTerm: 'IPHONE', limit: 20 })).to.deep.equal([iphone]);
  });

  it('honors the limit', async () => {
    expect(await catalog.list({ limit: 1 })).to.deep.equal([iphone]);
  });

  it('finds a product by id, and resolves to null for an unknown id', async () => {
    expect((await catalog.getById('XMI-RN13'))?.id).to.equal('XMI-RN13');
    expect(await catalog.getById('NOPE-404')).to.equal(null);
  });
});
