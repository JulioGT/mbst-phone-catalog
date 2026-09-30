/** Every flag the BFF knows about (docs/feature-flags.md). */
export const FEATURE_FLAGS = ['similar-products'] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

export function isFeatureFlag(name: string): name is FeatureFlag {
  return (FEATURE_FLAGS as readonly string[]).includes(name);
}
