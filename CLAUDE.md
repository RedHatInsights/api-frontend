# api-frontend

API documentation viewer for console.redhat.com/docs/api. Renders OpenAPI specs from cloud-services-config using swagger-ui-react.

## Commands

```bash
npm run start    # Dev server (fec dev, proxied to stage)
npm run build    # Production build (fec build)
npm run lint     # ESLint (src/)
npm test         # Currently a no-op (exit 0) — tests are not wired up
```

## Tech Stack

- React 18, TypeScript (strict), Redux
- PatternFly 6 (react-core, react-table, react-icons)
- swagger-ui-react for OpenAPI rendering
- Webpack via `fec` (frontend-components-config)
- Module Federation — app name `api-docs`, served at `/docs/api`

## Architecture

```
src/
  routes/
    Overview.tsx    # API listing page
    Detail.tsx      # Single API spec view (swagger-ui)
  store/            # Redux store (actions, reducers, action types)
  api/              # API constants and services
  Utilities/        # Hooks and helper functions
```

Entry points: `entry.ts` (prod), `entry-dev.ts` (dev). Routes defined in `Routes.tsx`.

## Testing

- Jest 29 + Testing Library configured but test script is `exit 0`
- Single test file: `src/Utilities/overviewRows.test.ts`
- No E2E tests

## Conventions

- ESLint with `@redhat-cloud-services/eslint-config-redhat-cloud-services`
- TypeScript ESLint: `no-explicit-any` warn, `no-unused-vars` error
- Sort imports enforced (ignoreDeclarationSort)
- SASS scoped with `.api-docs, .apiDocs` prefix
- SWC used for test transforms (`@swc/jest`)
