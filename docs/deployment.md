# Deployment (Render)

**Live:** https://mbst-phone-catalog.onrender.com (first deployed 2026-09-30; checked in a browser: search, detail, add to cart, cart, direct links, images, empty console).

The app runs as **one Node process**: the BFF serves the built web app (`apps/web/dist`), its assets and `/api`. [Render](https://render.com) hosts it as a web service described in [`render.yaml`](../render.yaml) (a "Blueprint": the service's settings as code, reviewed in git).

## How it runs

| Step | Command | Result |
|---|---|---|
| Build | `npm install -g pnpm@12.8.1 && pnpm install --frozen-lockfile && pnpm build` | `apps/web/dist` (minified, hashed) and `apps/bff/dist/main.js` (esbuild bundle) |
| Start | `node --enable-source-maps apps/bff/dist/main.js` | Listens on Render's `PORT`; `SERVE_WEB_APP=true` makes it serve the pages |
| Health | `GET /health` | Render only switches traffic to a new deploy once this answers |

Configuration comes from environment variables (see `.env.example`). `CATALOG_API_KEY` is declared in `render.yaml` with `sync: false`: Render asks for its value in the dashboard and stores it encrypted; it is never in the repository.

Locally, `pnpm build && pnpm start` runs exactly the same thing on http://localhost:3000 (reading the root `.env`).

## First deploy (one time, about 5 minutes)

1. Create a free account at https://render.com and sign in with GitHub.
2. In the dashboard: **New → Blueprint**. Connect the `mbst-phone-catalog` repository (give Render access to that repository only).
3. Render reads `render.yaml` and shows the `mbst-phone-catalog` web service. It asks for **`CATALOG_API_KEY`**: paste the key from the challenge statement.
4. Click **Apply** / **Deploy Blueprint**. The first build takes a few minutes; follow it under **Logs**.
5. When the status is **Live**, open the URL shown at the top (like `https://mbst-phone-catalog.onrender.com`).

After that, every merge to `main` deploys automatically.

## Good to know

- **Free plan cold starts.** The service sleeps after 15 minutes without traffic; the first request then takes 30-60 s. The remote catalog API is on Render too and can also be cold; the BFF waits up to `CATALOG_API_TIMEOUT_MS` (15 s) and the UI offers a retry.
- **Security headers.** `helmet` sets a Content-Security-Policy that allows scripts and styles from the app itself and images only from the app and the catalog's host (`img-src`, derived from `CATALOG_API_BASE_URL`).
- **Caching.** Hashed files under `/static` are cached for a year (`immutable`); `index.html` is revalidated on every visit, so a deploy is picked up at once.
- **Direct links** (`/products/SMG-S24U`, `/cart`) return the page and the client router renders them. With SSR (planned) unknown products will return a real 404.
- **Feature flag.** `FEATURE_FLAGS=similar-products` in `render.yaml`; remove it in the dashboard to hide similar products without a deploy (a restart is enough).
