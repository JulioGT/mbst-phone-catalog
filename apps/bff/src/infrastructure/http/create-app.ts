import { API_PATHS, type ApiErrorDto } from '@mbst/contracts';
import express, { type ErrorRequestHandler, type Express, type Router } from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import type { GetProductDetail } from '../../application/get-product-detail';
import type { ListProducts } from '../../application/list-products';
import type { Logger } from '../../application/ports/logger';
import { InvalidProductQueryError } from '../../domain/errors';
import { toProductDetailDto, toProductSummaryDto } from './dto-mapping';
import { toErrorResponse } from './error-response';

export interface AppDependencies {
  readonly listProducts: ListProducts;
  readonly getProductDetail: GetProductDetail;
  readonly logger: Logger;
}

// Query strings arrive as strings, or as arrays when a key is repeated.
// Shape is checked here; business ranges are checked by the use case.
const listQuerySchema = z.object({
  search: z.string().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .optional(),
});

function productRoutes({ listProducts, getProductDetail }: AppDependencies): Router {
  const router = express.Router();

  router.get('/', async (request, response) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) {
      const field = query.error.issues[0]?.path[0] === 'limit' ? 'limit' : 'searchTerm';
      throw new InvalidProductQueryError(
        field,
        field === 'limit'
          ? 'limit must be a whole number.'
          : 'search must be given at most once, as text.',
      );
    }
    const products = await listProducts.execute({
      searchTerm: query.data.search,
      limit: query.data.limit,
    });
    response.json(products.map(toProductSummaryDto));
  });

  router.get('/:productId', async (request, response) => {
    const product = await getProductDetail.execute(request.params.productId);
    response.json(toProductDetailDto(product));
  });

  return router;
}

/** Builds the Express app. It does not listen; main.ts does, and tests use supertest. */
export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());

  app.get(API_PATHS.health, (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use(API_PATHS.products, productRoutes(dependencies));

  app.use('/api', (_request, response) => {
    const body: ApiErrorDto = { error: 'NOT_FOUND', message: 'Unknown API route.' };
    response.status(404).json(body);
  });

  const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
    const { status, body } = toErrorResponse(error, dependencies.logger);
    response.status(status).json(body);
  };
  app.use(handleError);

  return app;
}
