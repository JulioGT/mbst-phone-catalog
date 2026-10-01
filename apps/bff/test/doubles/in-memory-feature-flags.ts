import type { FeatureFlagsPort } from '../../src/application/ports/feature-flags-port';
import type { FeatureFlag } from '../../src/domain/feature-flag';

/** Flags fixed at construction; used in tests to cover both states of a flag. */
export class InMemoryFeatureFlags implements FeatureFlagsPort {
  readonly #enabled: ReadonlySet<FeatureFlag>;

  constructor(enabled: readonly FeatureFlag[] = []) {
    this.#enabled = new Set(enabled);
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.#enabled.has(flag);
  }
}
