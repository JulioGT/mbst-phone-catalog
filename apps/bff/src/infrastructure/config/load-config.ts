import { z } from 'zod';

const configSchema = z.object({
  CATALOG_API_BASE_URL: z
    .url({ protocol: /^https?$/, error: 'must be an http(s) URL' })
    .transform((url) => url.replace(/\/+$/, '')),
  CATALOG_API_KEY: z
    .string({ error: 'is required' })
    .trim()
    .min(1, 'is required')
    .refine(
      (key) => !key.startsWith('replace-with'),
      'still has the placeholder from .env.example',
    ),
  CATALOG_API_TIMEOUT_MS: z.coerce.number().int().min(1).max(60_000).default(15_000),
  PORT: z.coerce.number().int().min(0).max(65_535).default(3000),
  FEATURE_FLAGS: z.string().default(''),
});

export interface Config {
  readonly catalogApiBaseUrl: string;
  readonly catalogApiKey: string;
  readonly catalogApiTimeoutMs: number;
  readonly port: number;
  readonly featureFlags: string;
}

export class InvalidConfigError extends Error {
  override readonly name = 'InvalidConfigError';
}

/**
 * Reads and validates the environment once, at startup. The process must not
 * start half-configured. Error messages name the variable but never echo its value.
 */
export function loadConfig(env: Readonly<Record<string, string | undefined>>): Config {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`);
    throw new InvalidConfigError(`Invalid configuration: ${problems.join('; ')}.`);
  }
  const config = result.data;
  return {
    catalogApiBaseUrl: config.CATALOG_API_BASE_URL,
    catalogApiKey: config.CATALOG_API_KEY,
    catalogApiTimeoutMs: config.CATALOG_API_TIMEOUT_MS,
    port: config.PORT,
    featureFlags: config.FEATURE_FLAGS,
  };
}
