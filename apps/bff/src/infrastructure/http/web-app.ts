import path from 'node:path';
import express, { type Router } from 'express';

/**
 * Serves the built web app (`apps/web/dist`) in production, so one process
 * handles pages, assets and `/api`. Hashed assets under `/static` never change,
 * so browsers may keep them for a year; `index.html` is always revalidated so
 * a new deploy is picked up at once. Any other page URL (`/products/SMG-S24U`)
 * gets `index.html`, and the React router takes over.
 */
export function webAppRoutes(directory: string): Router {
  const router = express.Router();
  const indexFile = path.join(directory, 'index.html');

  router.use(
    '/static',
    express.static(path.join(directory, 'static'), { immutable: true, maxAge: '1y' }),
  );
  // A missing asset is a plain 404; sending the page instead would hide the broken reference.
  router.use('/static', (_request, response) => {
    response.status(404).end();
  });
  router.use(express.static(directory, { index: false, maxAge: '1h' }));

  router.get(/^(?!\/api(?:\/|$)).*/, (request, response, next) => {
    if (!request.accepts('html')) {
      next();
      return;
    }
    response.setHeader('Cache-Control', 'no-cache');
    response.sendFile(indexFile);
  });

  return router;
}
