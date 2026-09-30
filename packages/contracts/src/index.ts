// Public API contract between the BFF and the web app: wire types plus runtime schemas.
// Prices travel as integer cents (ADR 0006); the field names say so.
import { z } from 'zod';

export const API_PATHS = {
  products: '/api/products',
  product: (productId: string) => `/api/products/${encodeURIComponent(productId)}`,
  health: '/health',
} as const;

const cents = z.number().int().nonnegative();

export const productSummaryDtoSchema = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  basePriceInCents: cents,
  imageUrl: z.string(),
});
export type ProductSummaryDto = z.infer<typeof productSummaryDtoSchema>;

export const productListDtoSchema = z.array(productSummaryDtoSchema);
export type ProductListDto = z.infer<typeof productListDtoSchema>;

export const colorOptionDtoSchema = z.object({
  name: z.string(),
  hexCode: z.string(),
  imageUrl: z.string(),
});
export type ColorOptionDto = z.infer<typeof colorOptionDtoSchema>;

export const storageOptionDtoSchema = z.object({
  capacity: z.string(),
  priceInCents: cents,
});
export type StorageOptionDto = z.infer<typeof storageOptionDtoSchema>;

/** Every attribute may be missing: the remote catalog does not fill all of them for every phone. */
export const specificationsDtoSchema = z.object({
  screen: z.string().optional(),
  resolution: z.string().optional(),
  processor: z.string().optional(),
  mainCamera: z.string().optional(),
  selfieCamera: z.string().optional(),
  battery: z.string().optional(),
  os: z.string().optional(),
  screenRefreshRate: z.string().optional(),
});
export type SpecificationsDto = z.infer<typeof specificationsDtoSchema>;

export const productDetailDtoSchema = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  description: z.string(),
  basePriceInCents: cents,
  specs: specificationsDtoSchema,
  colorOptions: z.array(colorOptionDtoSchema),
  storageOptions: z.array(storageOptionDtoSchema),
  /** Absent when the `similar-products` feature flag is off: the UI then hides the section. */
  similarProducts: z.array(productSummaryDtoSchema).optional(),
});
export type ProductDetailDto = z.infer<typeof productDetailDtoSchema>;

export const API_ERROR_CODES = [
  'INVALID_QUERY',
  'NOT_FOUND',
  'UPSTREAM_TIMEOUT',
  'UPSTREAM_ERROR',
  'INTERNAL_ERROR',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const apiErrorDtoSchema = z.object({
  error: z.enum(API_ERROR_CODES),
  message: z.string(),
});
export type ApiErrorDto = z.infer<typeof apiErrorDtoSchema>;
