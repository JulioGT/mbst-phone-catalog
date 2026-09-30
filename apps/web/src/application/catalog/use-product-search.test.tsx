import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { aProductSummary } from '../../../test/builders';
import { InMemoryCatalogGateway } from '../../../test/in-memory-catalog-gateway';
import type { ProductSummary } from '../../domain/product';
import type { CatalogGateway, SearchOptions } from '../ports/catalog-gateway';
import { CatalogGatewayProvider } from './catalog-gateway-context';
import { useProductSearch } from './use-product-search';

const galaxy = aProductSummary({ id: 'SMG-S24U', brand: 'Samsung', name: 'Galaxy S24 Ultra' });
const iphone = aProductSummary({ id: 'APL-IP15', brand: 'Apple', name: 'iPhone 15' });

function renderSearch(gateway: CatalogGateway, initialTerm = '') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CatalogGatewayProvider gateway={gateway}>{children}</CatalogGatewayProvider>
  );
  return renderHook(({ term }) => useProductSearch(term), {
    wrapper,
    initialProps: { term: initialTerm },
  });
}

/** A gateway whose answers the test releases one by one, in any order. */
class ControlledGateway implements CatalogGateway {
  readonly pending = new Map<
    string,
    { resolve: (products: ProductSummary[]) => void; signal: AbortSignal | undefined }
  >();

  searchProducts(searchTerm: string, options?: SearchOptions): Promise<readonly ProductSummary[]> {
    return new Promise((resolve) => {
      this.pending.set(searchTerm, { resolve, signal: options?.signal });
    });
  }

  getProduct(): Promise<null> {
    return Promise.resolve(null);
  }

  answer(searchTerm: string, products: ProductSummary[]): void {
    this.pending.get(searchTerm)?.resolve(products);
  }
}

describe('useProductSearch', () => {
  it('is loading, then lists the matching products', async () => {
    const { result } = renderSearch(new InMemoryCatalogGateway([galaxy, iphone]), 'apple');

    expect(result.current.status).toBe('loading');
    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'success', products: [iphone] }),
    );
  });

  it('reports an error, and a retry runs the same search again', async () => {
    const gateway = new InMemoryCatalogGateway([galaxy]);
    gateway.failNext();
    const { result } = renderSearch(gateway, 'galaxy');

    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'success', products: [galaxy] }),
    );
    expect(gateway.searches).toEqual(['galaxy', 'galaxy']);
  });

  it('shows the latest search even when an older answer arrives last', async () => {
    const gateway = new ControlledGateway();
    const { result, rerender } = renderSearch(gateway, 'sam');

    rerender({ term: 'samsung' });
    await waitFor(() => expect(gateway.pending.has('samsung')).toBe(true));
    act(() => gateway.answer('samsung', [galaxy]));
    act(() => gateway.answer('sam', [iphone]));

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'success', products: [galaxy] }),
    );
  });

  it('aborts the request for a term that was replaced', async () => {
    const gateway = new ControlledGateway();
    const { rerender } = renderSearch(gateway, 'sam');
    await waitFor(() => expect(gateway.pending.has('sam')).toBe(true));

    rerender({ term: 'samsung' });

    expect(gateway.pending.get('sam')?.signal?.aborted).toBe(true);
    expect(gateway.pending.get('samsung')?.signal?.aborted).toBe(false);
  });
});
