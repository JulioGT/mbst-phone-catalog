import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { CartProvider } from '../src/application/cart/cart-context';
import type { Cart } from '../src/domain/cart';
import { routes } from '../src/ui/routes';
import { InMemoryCartStorage } from './in-memory-cart-storage';

/** Renders the whole app at `path`, with an in-memory cart instead of localStorage. */
export function renderApp(path = '/', { cart = [] as Cart } = {}) {
  const storage = new InMemoryCartStorage(cart);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const view = render(
    <CartProvider storage={storage}>
      <RouterProvider router={router} />
    </CartProvider>,
  );
  return { ...view, router, storage };
}
