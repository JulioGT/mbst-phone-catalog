// Schemas of the remote catalog API as observed (docs/api-contract.md).
// Strict about what the app needs, lenient about what it does not: unknown
// keys (such as `rating`, or `specs.storage` on one phone) are dropped.
import { z } from 'zod';

const euros = z.number().nonnegative();
const imageUrl = z.string().regex(/^https?:\/\//, 'must be an http(s) URL');

export const upstreamProductSummarySchema = z.object({
  id: z.string().min(1),
  brand: z.string(),
  name: z.string(),
  basePrice: euros,
  imageUrl,
});
export type UpstreamProductSummary = z.infer<typeof upstreamProductSummarySchema>;

export const upstreamProductListSchema = z.array(upstreamProductSummarySchema);

export const upstreamProductDetailSchema = z.object({
  id: z.string().min(1),
  brand: z.string(),
  name: z.string(),
  description: z.string(),
  basePrice: euros,
  specs: z.object({
    screen: z.string().optional(),
    resolution: z.string().optional(),
    processor: z.string().optional(),
    mainCamera: z.string().optional(),
    selfieCamera: z.string().optional(),
    battery: z.string().optional(),
    os: z.string().optional(),
    screenRefreshRate: z.string().optional(),
  }),
  colorOptions: z.array(
    z.object({
      name: z.string(),
      // Both long (#E6E6FA) and short (#000) forms occur.
      hexCode: z.string().regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i, 'must be a hex color'),
      imageUrl,
    }),
  ),
  storageOptions: z.array(z.object({ capacity: z.string(), price: euros })),
  similarProducts: z.array(upstreamProductSummarySchema).default([]),
});
export type UpstreamProductDetail = z.infer<typeof upstreamProductDetailSchema>;
