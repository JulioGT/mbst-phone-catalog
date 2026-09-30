import type { RouteObject } from 'react-router';
import { AppLayout } from './app-layout';
import { CartPage } from './pages/cart-page';
import { NotFoundPage } from './pages/not-found-page';
import { ProductDetailPage } from './pages/product-detail-page';
import { ProductListPage } from './pages/product-list-page';

/**
 * Route table (docs/information-architecture.md). Plain route objects so the
 * browser router now, and the server renderer in chunk 9, share one definition.
 */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <ProductListPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
