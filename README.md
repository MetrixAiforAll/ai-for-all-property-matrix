# MatrixClaimed

A premium-feeling Vite + React property opportunity dashboard for Los Angeles. Includes responsive property search and filters, demo inventory, market analytics, grid/list/map views, saved listings, and a persistent dark theme.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Connect a property data source

The app can consume a JSON endpoint through `VITE_PROPERTIES_API_URL`. Copy `.env.example` to `.env.local` and set the URL to **your own backend/API proxy**. The browser requests that endpoint directly; configure CORS on your server if it is on another origin. Do not put vendor API keys or secrets in `VITE_*` variables, since Vite exposes them to browser code. Keep credentials on a trusted backend and have it return the normalized response below.

Response may be a JSON array or `{ "properties": [...] }`. Each listing must include `id`, `address`, `neighborhood`, `price`, `beds`, `baths`, `sqft`, `status`, and `score`. Optional fields: `estimate`, `lat`, `lng`, `days`, and `image`. `latitude`/`longitude`, `estimatedValue`, and `daysAgo` are accepted aliases. Missing coordinates use illustrative LA demo positions; provide real coordinates for accurate mapping. Any fetch or schema error falls back to the clearly labeled demo listings.

No provider has been selected or credentials supplied, so the app is integration-ready rather than connected to a specific commercial property-data vendor. Ensure your provider permits the intended use and that listings/statuses are verified before relying on them. Demo data is fictional and not investment advice.
