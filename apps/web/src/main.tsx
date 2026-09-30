/**
 * Composition root: builds the adapters and hands them to the app. The only
 * place that touches `window` directly (docs/architecture.md).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { CartProvider } from './application/cart/cart-context';
import { CatalogGatewayProvider } from './application/catalog/catalog-gateway-context';
import { HttpCatalogGateway } from './infrastructure/http-catalog-gateway';
import { LocalStorageCartStorage } from './infrastructure/local-storage-cart-storage';
import { routes } from './ui/routes';
import './ui/styles/tokens.css';
import './ui/styles/base.css';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('The page has no #root element to render into.');
}

const cartStorage = new LocalStorageCartStorage(() => window.localStorage);
const catalogGateway = new HttpCatalogGateway();
const router = createBrowserRouter(routes);

createRoot(container).render(
  <StrictMode>
    <CatalogGatewayProvider gateway={catalogGateway}>
      <CartProvider storage={cartStorage}>
        <RouterProvider router={router} />
      </CartProvider>
    </CatalogGatewayProvider>
  </StrictMode>,
);
