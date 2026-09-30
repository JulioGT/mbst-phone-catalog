// Composition root: the only place that reads the environment, builds the
// adapters and wires them into the use cases (docs/architecture.md).
import { GetProductDetail } from './application/get-product-detail';
import { ListProducts } from './application/list-products';
import { HttpProductCatalog } from './infrastructure/catalog/http-product-catalog';
import { loadConfig } from './infrastructure/config/load-config';
import { EnvFeatureFlags } from './infrastructure/flags/env-feature-flags';
import { createApp } from './infrastructure/http/create-app';
import { JsonLineLogger } from './infrastructure/logging/json-line-logger';

const logger = new JsonLineLogger(process.stdout);

function start(): void {
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

  const app = createApp({
    listProducts: new ListProducts(catalog),
    getProductDetail: new GetProductDetail(catalog, flags),
    logger,
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
