# Order Book Visualization

A real-time order book UI built with [Next.js](https://nextjs.org), featuring live WebSocket updates, pair selection, and a Binance-style layout.

## Features

- **Live order book** – Bids and asks with depth bars, price/amount/total columns (Total = Price × Amount in quote currency)
- **Pair selector** – Switch markets from a dropdown; base currency icons (CDN) with fallback
- **Spread/depth** – Aggregate levels by spread (0.01, 0.1, 1) and configurable depth
- **Header** – Live status, last update time, bid/ask volume bar (notional %), theme toggle
- **WebSocket** – Real-time stream with auto-reconnect (exponential backoff) and reconnect on tab focus
- **Markets API** – Fetched via Next.js API proxy (`/api/v1/markets`) to avoid CORS when deployed (e.g. Vercel)
- **Checksum** – Order book checksum verification with re-subscribe on mismatch
- **Tests** – Vitest for checksum, market API utils, order-book-view utils, and env parsers

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** – Styling
- **Zustand** – Order book state
- **TanStack Query** – Markets data
- **Vitest** – Unit tests

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

### Install and run

```bash
npm install
cp .env.example .env.local   # optional: edit API/WS URLs and market IDs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base URL (used by proxy and server) | `https://api.testnet.rise.trade/v1` |
| `NEXT_PUBLIC_WS_BASE_URL` | WebSocket URL | `wss://ws.testnet.rise.trade/ws` |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | API request timeout (ms) | `10000` |
| `NEXT_PUBLIC_ORDERBOOK_MARKET_IDS` | Comma-separated market IDs for order book | `1,2` |

For production (e.g. Vercel), set these in the project’s environment; the app uses the same-origin `/api/v1/markets` proxy so the browser does not call the external API directly (avoids CORS).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (no warnings) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Project structure

```text
app/
  api/v1/markets/     # Proxy for markets API (avoids CORS)
  layout.tsx
  page.tsx
  providers.tsx       # Theme, React Query, order book store + stream bootstrap

src/
  features/
    market/           # Markets REST API, DTOs, types, React Query hook
    order-book/
      api/           # WebSocket service, stream (subscribe/reconnect)
      model/         # Zustand store, engine (snapshot/delta/aggregation), checksum
      types/         # Order book types
      ui/            # Header, pair selector, spread selector, bids/asks panels, utils

  shared/
    api/             # API client (base URL, timeout)
    config/          # Env (apiBaseUrl, wsBaseUrl, etc.)
    services/websocket/  # Generic WebSocket service
    theme/           # Theme provider
    utils/           # Env parsers (toNumber, toNumberArray)
```

## Deployment (Vercel)

1. Connect the repo to Vercel.
2. Add environment variables in **Settings → Environment Variables** (same as `.env.example`).
3. Deploy. The markets request goes to your app’s `/api/v1/markets`, which proxies to `NEXT_PUBLIC_API_BASE_URL/markets` on the server.

Redeploy after changing env vars.

## Fonts

The app uses [Geist](https://vercel.com/font) via `next/font` for sans and mono.
