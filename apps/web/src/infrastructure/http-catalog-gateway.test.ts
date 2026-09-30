import { CatalogUnavailableError } from '../domain/errors';
import { HttpCatalogGateway } from './http-catalog-gateway';

const aProductDto = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePriceInCents: 132900,
  imageUrl: 'https://catalog.test/images/SMG-S24U.webp',
};

function fetchReturning(status: number, body: unknown) {
  const calls: string[] = [];
  const fetchStub: typeof fetch = async (input) => {
    calls.push(String(input));
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
  };
  return { fetchStub, calls };
}

describe('HttpCatalogGateway', () => {
  it('asks the BFF for the trimmed search term and maps prices to Money', async () => {
    const { fetchStub, calls } = fetchReturning(200, [aProductDto]);
    const gateway = new HttpCatalogGateway({ fetch: fetchStub });

    const products = await gateway.searchProducts('  galaxy s24 ');

    expect(calls).toEqual(['/api/products?search=galaxy+s24']);
    expect(products).toEqual([
      {
        id: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        basePrice: 132900,
        imageUrl: 'https://catalog.test/images/SMG-S24U.webp',
      },
    ]);
  });

  it('asks for the whole list when the term is blank', async () => {
    const { fetchStub, calls } = fetchReturning(200, []);

    await new HttpCatalogGateway({ fetch: fetchStub, baseUrl: 'http://bff.test' }).searchProducts(
      ' ',
    );

    expect(calls).toEqual(['http://bff.test/api/products']);
  });

  it.each([
    ['an error status', 502, { error: 'UPSTREAM_ERROR', message: 'x' }],
    ['a body that breaks the contract', 200, [{ ...aProductDto, basePriceInCents: '1329' }]],
    ['a body that is not JSON', 200, '<html>'],
  ])('rejects %s as unavailable', async (_case, status, body) => {
    const { fetchStub } = fetchReturning(status, body);

    await expect(
      new HttpCatalogGateway({ fetch: fetchStub }).searchProducts(''),
    ).rejects.toBeInstanceOf(CatalogUnavailableError);
  });

  it('rejects a network failure as unavailable', async () => {
    const failing: typeof fetch = () => Promise.reject(new TypeError('Failed to fetch'));

    await expect(
      new HttpCatalogGateway({ fetch: failing }).searchProducts(''),
    ).rejects.toBeInstanceOf(CatalogUnavailableError);
  });

  it('rejects with the abort reason, not as unavailable, when the search is replaced', async () => {
    const controller = new AbortController();
    const hanging: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });

    const search = new HttpCatalogGateway({ fetch: hanging }).searchProducts('sam', {
      signal: controller.signal,
    });
    controller.abort();

    await expect(search).rejects.not.toBeInstanceOf(CatalogUnavailableError);
  });
});

describe('HttpCatalogGateway.getProduct', () => {
  const aDetailDto = {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    description: 'Gama alta.',
    basePriceInCents: 132900,
    specs: { screen: '6.8"' },
    colorOptions: [{ name: 'Negro', hexCode: '#000', imageUrl: 'https://catalog.test/black.webp' }],
    storageOptions: [{ capacity: '256 GB', priceInCents: 122900 }],
  };

  it('fetches the product by its encoded id and maps it', async () => {
    const { fetchStub, calls } = fetchReturning(200, aDetailDto);

    const product = await new HttpCatalogGateway({ fetch: fetchStub }).getProduct('a/b');

    expect(calls).toEqual(['/api/products/a%2Fb']);
    expect(product).toEqual({
      ...aDetailDto,
      basePriceInCents: undefined,
      basePrice: 132900,
      storageOptions: [{ capacity: '256 GB', price: 122900 }],
    });
    expect(product).not.toHaveProperty('similarProducts');
  });

  it('keeps similar products when the BFF sends them', async () => {
    const { fetchStub } = fetchReturning(200, { ...aDetailDto, similarProducts: [aProductDto] });

    const product = await new HttpCatalogGateway({ fetch: fetchStub }).getProduct('SMG-S24U');

    expect(product?.similarProducts?.[0]?.basePrice).toBe(132900);
  });

  it('resolves to null for an unknown product', async () => {
    const { fetchStub } = fetchReturning(404, {
      error: 'NOT_FOUND',
      message: 'Product not found.',
    });

    expect(await new HttpCatalogGateway({ fetch: fetchStub }).getProduct('NOPE')).toBeNull();
  });

  it('rejects other failures as unavailable', async () => {
    const { fetchStub } = fetchReturning(504, { error: 'UPSTREAM_TIMEOUT', message: 'x' });

    await expect(
      new HttpCatalogGateway({ fetch: fetchStub }).getProduct('SMG-S24U'),
    ).rejects.toBeInstanceOf(CatalogUnavailableError);
  });
});
