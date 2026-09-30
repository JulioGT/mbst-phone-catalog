import { useCallback, useEffect, useState } from 'react';
import type { ProductDetail } from '../../domain/product';
import { useCatalogGateway } from './catalog-gateway-context';

export type ProductDetailState =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly product: ProductDetail }
  | { readonly status: 'not-found' }
  | { readonly status: 'error' };

export type ProductDetailQuery = ProductDetailState & {
  /** Loads the same product again, after an error. */
  readonly retry: () => void;
};

/**
 * One product by id. Moving to another product (a similar item) aborts the
 * previous request and ignores its late answer, like the search does.
 */
export function useProductDetail(productId: string): ProductDetailQuery {
  const gateway = useCatalogGateway();
  /**
   * The state remembers which product it belongs to. A new id is "loading" at
   * once, so the page never shows the previous phone under the new address.
   */
  const [state, setState] = useState<{ productId: string; value: ProductDetailState }>({
    productId,
    value: { status: 'loading' },
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // `attempt` is read so that retry() re-runs this effect.
    void attempt;
    const controller = new AbortController();
    setState({ productId, value: { status: 'loading' } });

    gateway.getProduct(productId, { signal: controller.signal }).then(
      (product) => {
        if (!controller.signal.aborted) {
          setState({
            productId,
            value: product === null ? { status: 'not-found' } : { status: 'success', product },
          });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ productId, value: { status: 'error' } });
        }
      },
    );

    return () => controller.abort();
  }, [gateway, productId, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const current: ProductDetailState =
    state.productId === productId ? state.value : { status: 'loading' };
  return { ...current, retry };
}
