# Feature flags and experimentation

> Status: the BFF side is implemented (`EnvFeatureFlags`, chunk 3); the UI side comes in chunk 6. The GrowthBook adapter is documented but not built (it is not part of the challenge).

## Concept

A **feature flag** is a named switch read at runtime. Code for a feature ships switched off, and someone turns it on later without a deployment. Uses: dark releases, gradual rollouts (10% then 100%), a kill switch, and **experiments** (A/B tests) where users are split between variants and a metric is compared.

**GrowthBook** is an open-source platform for that: features and rules are defined in its dashboard (targeting, rollout percentage, experiment variants) and applications read them through an SDK.

## Design

```
application:   FeatureFlagsPort { isEnabled(flag: FeatureFlag): boolean }
infrastructure: EnvFeatureFlags        reads FEATURE_FLAGS=similar-products,...   (default)
                GrowthBookFeatureFlags  reads flags from GrowthBook               (documented)
                InMemoryFeatureFlags    used in tests
```

The domain and use cases only know the port. Swapping the provider changes `main.ts`, nothing else.

## Where flags are evaluated: the BFF

Evaluating on the server means the page arrives already in its final state (no flicker between variants during SSR/hydration), and the browser needs no flag SDK. In practice the BFF **shapes the response** and the UI renders whatever it receives.

## The flag we implement

| Flag | Effect when OFF |
|---|---|
| `similar-products` | `GET /api/products/:id` omits `similarProducts`; the UI does not render the section |

The UI has no flag logic: "no `similarProducts` in the payload" is the whole contract.

## GrowthBook adapter sketch

Build a server-side GrowthBook instance with the API host and client key from the environment, load features once at startup and refresh periodically, and implement `isEnabled` as `growthbook.isOn(flag)` with user attributes when they exist. Check the SDK's current documentation when implementing; the details above are an outline, not verified code.

An experiment would follow the same port with a second method returning a variant (for example `variant('add-button-label')`), plus an exposure/tracking callback so results can be analyzed.

## Conventions

- Kebab-case names, describing the capability (`similar-products`), not the team or ticket.
- Every flag has an owner and a removal plan; once fully rolled out, delete the flag and its dead branch.
- Tests cover both states with `InMemoryFeatureFlags`.
