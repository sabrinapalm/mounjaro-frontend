# Tracksy agent guide

Tracksy is a React and TypeScript frontend built with Vite and TanStack Query. Preserve its
existing user experience, data, routes/navigation, API contracts, and authentication behavior.
Inspect the affected code and configuration before changing it; prefer small, verifiable changes.

## Architecture

```text
src/
  app/                 # App shell, dashboard composition, navigation, providers
  features/
    auth/
    check-ins/
    dashboard/
    insights/
    milestones/
    profile/
    shots/
    weight/
  shared/              # Genuinely cross-feature modules
  main.tsx             # Browser entry point
```

- Keep feature-owned pages, components, hooks, API functions, query keys, and calculations in
  their feature. Put shared domain types and genuinely reused UI/utilities in `shared/`.
- Use a feature's `index.ts` as its public boundary when another feature or the app shell consumes
  it. Do not reach into another feature's private files or create barrel files without a consumer.
- `DashboardShell` owns the existing in-app section navigation; do not add or change URL routing
  without a product requirement.
- Keep each component's CSS beside it. Global styles belong in `shared/styles/global.css`.

## TypeScript and React

- Use strict, explicit domain types. Prefer `type`; use `interface` when extension is useful.
- Avoid `any`, unnecessary assertions, non-null assertions, and duplicated domain definitions.
  Treat untrusted external values as `unknown` and validate only where needed.
- Prefer `const` arrow functions and named exports for components, hooks, handlers, utilities, API
  functions, and query functions. Keep default exports only where tooling requires them.
- Name React components and types in `PascalCase`, values and files in `camelCase`, and hooks with
  a `use` prefix.
- Keep components focused. Keep server state in TanStack Query and local UI state local; avoid
  duplicated state and unnecessary effects, memoization, and callback wrappers.
- Preserve existing accessibility, responsive behavior, forms, validation, loading/error/empty
  states, and styling. Do not replace the UI or CSS approach during structural work.

## Data and API

- Put feature endpoints and request/response types in that feature's `api/`; use
  `shared/api/request.ts` only for authenticated transport and shared response handling.
- Put query hooks in the owning feature's `hooks/` and stable query keys in its `queryKeys.ts`.
  Keep key values, cache persistence, and invalidation behavior compatible with existing data.
- Handle request errors explicitly. Preserve Cognito token behavior and existing API routes,
  methods, payloads, response shapes, and date/time semantics.
- Keep weight/unit conversions centralized and preserve metric/imperial storage semantics. Do not
  change medication, dosage, injection-site, side-effect, milestone, or progress rules implicitly.
- Do not add Zod or another runtime validation dependency without an explicit request.

## Styling and dependencies

- Follow the existing CSS files, class naming, responsive patterns, and Biome/ESLint configuration.
- Use **pnpm 10.28.2** directly; Corepack is not required. Keep `package.json` and
  `pnpm-lock.yaml` synchronized, use `pnpm install --frozen-lockfile` for verification, and do not
  add npm or Yarn lockfiles.
- Do not add dependencies or scripts unless needed and justified. Use existing commands:
  `pnpm run build`, `pnpm run lint`, and `pnpm run check`.

## Tests and backend boundaries

- There is currently no configured test runner or test script. Do not install one just for a
  refactor. If tests are introduced in a separately scoped change, put them in nearby `__tests__/`
  folders and use behavior-focused tests with the chosen existing project tooling.
- This checkout contains the frontend only; it has no SST, Lambda, API Gateway, DynamoDB, or
  Cognito infrastructure definitions. Do not infer or change deployed infrastructure. Preserve
  the frontend's existing API/auth contract; any backend or SST work requires its own source,
  migration plan, and explicit scope.

## Refactoring

- Move files and update imports before changing behavior. Refactor one feature at a time and
  verify the affected build/lint/check commands.
- Remove code or dependencies only when unused status is clear. Avoid unrelated cleanup,
  unnecessary abstractions, placeholder folders, and broad rewrites.
- Report checks run and any existing or remaining failures honestly.
