This is a [Next.js](https://nextjs.org) order-book project with a feature-based architecture.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - start local server
- `npm run build` - build production bundle
- `npm run start` - start production server
- `npm run lint` - run ESLint with no warnings allowed
- `npm run lint:fix` - fix auto-fixable ESLint issues
- `npm run typecheck` - run TypeScript checks
- `npm run format` - format code with Prettier
- `npm run format:check` - check formatting

## Folder Structure

```text
app/                               # Next.js app router entry points (UI to be implemented later)
src/
  features/
    order-book/
      api/                         # Feature-level API and websocket adapters
      model/                       # Feature state (Zustand store)
      types/                       # Feature contracts
  shared/
    api/                           # API client and transport-level types
    config/                        # Environment + runtime config
    services/websocket/            # Generic websocket service skeleton
    store/                         # Store creation and selector helpers
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notes

- UI is intentionally not implemented yet.
- Zustand stores should be consumed with selective selectors (for example, `store.use.someSlice()`).
