import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

/**
 * Development (`rsbuild dev`) serves unminified assets with source maps;
 * production (`rsbuild build`) emits minified, hashed bundles. Both are
 * Rsbuild defaults, which is what the challenge asks for.
 */
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: { index: './src/main.tsx' },
  },
  html: {
    title: 'Phones | MBST',
  },
  server: {
    port: 3001,
    // The browser only talks to its own origin; the BFF (port 3000) holds the API key.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
