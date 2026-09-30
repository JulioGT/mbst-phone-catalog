/**
 * Architecture rules (see docs/architecture.md).
 * Hexagonal layering: dependencies point inward.
 *
 *   ui  ->  application  ->  domain
 *   infrastructure  ->  application  ->  domain      (infrastructure implements ports)
 *
 * The composition roots (src/main.ts, src/main.tsx) live outside the layers
 * on purpose: they are the only place that may wire everything together.
 *
 * These rules are themselves tested: tools/architecture/architecture.test.mjs
 */
const NPM_TYPES = [
  'npm',
  'npm-dev',
  'npm-optional',
  'npm-peer',
  'npm-bundled',
  'npm-no-pkg',
  'npm-unknown',
];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make layering impossible to reason about.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment:
        'The domain depends on nothing but itself: no other layers, no packages, no Node/DOM modules.',
      from: { path: '^apps/(bff|web)/src/domain/' },
      to: { pathNot: '^apps/(bff|web)/src/domain/' },
    },
    {
      name: 'bff-application-has-no-packages',
      severity: 'error',
      comment:
        'BFF use cases and ports are plain TypeScript. Frameworks (Express, HTTP clients, Zod) belong in infrastructure.',
      from: { path: '^apps/bff/src/application/' },
      to: { dependencyTypes: NPM_TYPES },
    },
    {
      name: 'application-not-to-outer-layers',
      severity: 'error',
      comment: 'Application code talks to infrastructure only through ports (interfaces).',
      from: { path: '^apps/(bff|web)/src/application/' },
      to: { path: '^apps/(bff|web)/src/(infrastructure|ui)/' },
    },
    {
      name: 'infrastructure-not-to-ui',
      severity: 'error',
      comment: 'Adapters must not know about the presentation layer.',
      from: { path: '^apps/web/src/infrastructure/' },
      to: { path: '^apps/web/src/ui/' },
    },
    {
      name: 'ui-not-to-infrastructure',
      severity: 'error',
      comment: 'Components get data through application hooks, never straight from adapters.',
      from: { path: '^apps/web/src/ui/' },
      to: { path: '^apps/web/src/infrastructure/' },
    },
    {
      name: 'apps-are-isolated',
      severity: 'error',
      comment: 'The BFF and the web app share code only through packages/contracts.',
      from: { path: '^apps/bff/' },
      to: { path: '^apps/web/' },
    },
    {
      name: 'web-not-to-bff',
      severity: 'error',
      comment: 'The BFF and the web app share code only through packages/contracts.',
      from: { path: '^apps/web/' },
      to: { path: '^apps/bff/' },
    },
    {
      name: 'contracts-are-standalone',
      severity: 'error',
      comment: 'packages/contracts must not depend on any app.',
      from: { path: '^packages/contracts/' },
      to: { path: '^apps/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    exclude: { path: '(^|/)(dist|coverage|\\.turbo|\\.rsbuild)/' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
    },
  },
};
