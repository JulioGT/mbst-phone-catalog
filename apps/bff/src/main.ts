/**
 * Composition root: the only place that reads the environment, builds the
 * adapters and wires them into the use cases (docs/architecture.md).
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GetProductDetail } from './application/get-product-detail';
import { ListProducts } from './application/list-products';
import { HttpProductCatalog } from './infrastructure/catalog/http-product-catalog';
import { loadConfig } from './infrastructure/config/load-config';
import { EnvFeatureFlags } from './infrastructure/flags/env-feature-flags';
import { createApp } from './infrastructure/http/create-app';
import { JsonLineLogger } from './infrastructure/logging/json-line-logger';

const logger = new JsonLineLogger(process.stdout);

/** Both `src/main.ts` (development) and `dist/main.js` (production) sit two levels below the repo's apps/. */
const ROOT_ENV_FILE = fileURLToPath(new URL('../../../.env', import.meta.url));
const WEB_APP_DIRECTORY = fileURLToPath(new URL('../../web/dist', import.meta.url));

function start(): void {
  // Local runs read the repo's .env; hosts such as Render set real environment variables instead.
  if (existsSync(ROOT_ENV_FILE)) {
    process.loadEnvFile(ROOT_ENV_FILE);
  }
  const config = loadConfig(process.env);

  const flags = new EnvFeatureFlags(config.featureFlags);
  if (flags.unknownNames.length > 0) {
    logger.warn('Ignoring unknown feature flags', { names: flags.unknownNames.join(',') });
  }

  const catalog = new HttpProductCatalog({
    baseUrl: config.catalogApiBaseUrl,
    apiKey: config.catalogApiKey,
    timeoutMs: config.catalogApiTimeoutMs,
    logger,
  });

  if (config.serveWebApp && !existsSync(`${WEB_APP_DIRECTORY}/index.html`)) {
    throw new Error(
      `SERVE_WEB_APP is true but ${WEB_APP_DIRECTORY} has no build. Run pnpm build first.`,
    );
  }

  const app = createApp({
    listProducts: new ListProducts(catalog),
    getProductDetail: new GetProductDetail(catalog, flags),
    logger,
    imageOrigins: [config.catalogImageOrigin],
    ...(config.serveWebApp ? { webAppDirectory: WEB_APP_DIRECTORY } : {}),
  });

  const server = app.listen(config.port, () => {
    logger.info('BFF listening', { port: config.port });
  });

  // Render (and most hosts) stop a service with SIGTERM: finish open requests first.
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      logger.info('Shutting down', { signal });
      server.close(() => process.exit(0));
    });
  }
}

try {
  start();
} catch (error) {
  logger.error('BFF failed to start', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}
