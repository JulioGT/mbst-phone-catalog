import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { CartProvider } from '../src/application/cart/cart-context';
import { CatalogGatewayProvider } from '../src/application/catalog/catalog-gateway-context';
import type { CatalogGateway } from '../src/application/ports/catalog-gateway';
import type { Cart } from '../src/domain/cart';
import { routes } from '../src/ui/routes';
import { InMemoryCartStorage } from './in-memory-cart-storage';
import { InMemoryCatalogGateway } from './in-memory-catalog-gateway';

export interface RenderAppOptions {
  readonly cart?: Cart;
  readonly gateway?: CatalogGateway;
}

/** Renders the whole app at `path`, with in-memory adapters instead of the network and localStorage. */
export function renderApp(
  path = '/',
  { cart = [], gateway = new InMemoryCatalogGateway() }: RenderAppOptions = {},
) {
  const storage = new InMemoryCartStorage(cart);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const view = render(
    <CatalogGatewayProvider gateway={gateway}>
      <CartProvider storage={storage}>
        <RouterProvider router={router} />
      </CartProvider>
    </CatalogGatewayProvider>,
  );
  return { ...view, router, storage, gateway };
}
