import { useCallback, useEffect, useState } from 'react';
import type { ProductSummary } from '../../domain/product';
import { useCatalogGateway } from './catalog-gateway-context';

export type ProductSearchState =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly products: readonly ProductSummary[] }
  | { readonly status: 'error' };

export type ProductSearch = ProductSearchState & {
  /** Runs the same search again, after an error. */
  readonly retry: () => void;
};

/**
 * Products matching `searchTerm`, searched by the API. Each new term aborts the
 * previous request, and a late answer to an old term is ignored, so results
 * always belong to the latest term. Debouncing the typing is the caller's job.
 */
export function useProductSearch(searchTerm: string): ProductSearch {
  const gateway = useCatalogGateway();
  const [state, setState] = useState<ProductSearchState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // `attempt` is read so that retry() re-runs this effect.
    void attempt;
    const controller = new AbortController();
    setState({ status: 'loading' });

    gateway.searchProducts(searchTerm, { signal: controller.signal }).then(
      (products) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', products });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ status: 'error' });
        }
      },
    );

    return () => controller.abort();
  }, [gateway, searchTerm, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  return { ...state, retry };
}
