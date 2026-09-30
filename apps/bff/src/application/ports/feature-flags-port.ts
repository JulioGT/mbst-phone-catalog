import type { FeatureFlag } from '../../domain/feature-flag';

export interface FeatureFlagsPort {
  isEnabled(flag: FeatureFlag): boolean;
}
