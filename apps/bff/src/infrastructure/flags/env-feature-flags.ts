import type { FeatureFlagsPort } from '../../application/ports/feature-flags-port';
import { type FeatureFlag, isFeatureFlag } from '../../domain/feature-flag';

/**
 * Flags switched on by a comma-separated list, such as the FEATURE_FLAGS
 * environment variable: `similar-products,other-flag`. Unknown names are kept
 * in `unknownNames` so the composition root can warn about typos.
 */
export class EnvFeatureFlags implements FeatureFlagsPort {
  readonly #enabled: ReadonlySet<FeatureFlag>;
  readonly unknownNames: readonly string[];

  constructor(list: string | undefined) {
    const names = (list ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name !== '');
    this.#enabled = new Set(names.filter(isFeatureFlag));
    this.unknownNames = names.filter((name) => !isFeatureFlag(name));
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.#enabled.has(flag);
  }
}
