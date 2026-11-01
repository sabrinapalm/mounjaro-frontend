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
    dashboard/
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
- Keep necessary component CSS beside its owner. Shared UI primitives belong in
  `shared/components/ui/`; global tokens and resets belong in `shared/styles/global.css`, and
  Tailwind's CSS-first theme configuration belongs in `shared/styles/tailwind.css`.

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
  states, and styling. Structural work must not redesign the UI.

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

- Use Tailwind CSS v4 through `@tailwindcss/vite`; there is no Tailwind v3 JavaScript config or
  PostCSS integration. Preflight is intentionally omitted to preserve Tracksy's existing reset,
  typography, and native form controls.
- Use semantic utilities (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`)
  backed by Tracksy's existing CSS variables. Keep the forest-green palette, dimensions,
  typography, shadows, radii, and `html[data-theme="dark"]` theme behavior unchanged. Do not
  introduce shadcn's default palette, a second theme provider, or a `.dark` toggle.
- Prefer utility classes for new simple layouts. Existing component CSS may use `@apply` to keep
  selector specificity, cascade order, and responsive behavior stable. Such files must
  `@reference` `shared/styles/tailwind.css` using a relative path. Keep gradients, chart/SVG rules,
  native picker pseudo-elements, safe-area expressions, and custom animations in CSS when useful.
  Do not retain a CSS declaration after replacing it with an equivalent utility.
- Preserve exact existing breakpoint values and inclusive `max-width` behavior; do not substitute
  Tailwind's default breakpoints. Preserve reduced-motion and pointer/hover media queries.
- `components.json` configures shadcn/ui's manual existing-project setup. Own and customize the
  source under `shared/components/ui/`; add only primitives with real consumers. Use `cn` from
  `shared/utils/cn.ts` to merge utility classes, arrow functions, named exports, and explicit prop
  types. Retain semantic elements with `asChild` where needed. Do not add unused primitives,
  another icon library, Zod, or new form/state infrastructure.
- The existing public `shared/components/Button.tsx` owns loading and icon behavior; the UI
  primitive owns variants. Form controls share their surface while feature styles own dimensions
  and focus treatments. Native selects, date/time pickers, custom dialogs/navigation, and Recharts
  retain their current behavior; do not replace them merely because shadcn offers an alternative.
- Before a styling migration, capture real rendered baselines with sanitized data. Compare each
  category at identical desktop/mobile widths, both themes, and matching UI states, including
  dialogs and forms. Resolve visual regressions before proceeding. Report coverage and any
  unavailable visual testing honestly. See `docs/styling-migration.md` for the migration audit.
- Follow the Biome/ESLint configuration; Biome's CSS parser enables Tailwind directives.
- Use **pnpm 10.28.2** directly; Corepack is not required. Keep `package.json` and
  `pnpm-lock.yaml` synchronized, use `pnpm install --frozen-lockfile` for verification, and do not
  add npm or Yarn lockfiles.
- Do not add dependencies or scripts unless needed and justified. Use existing commands:
  `pnpm run build`, `pnpm run lint`, and `pnpm run check`.

## Tests and backend boundaries

- There is no test script or third-party test runner. Existing nearby `__tests__/*.test.mjs` files
  use Node's built-in runner; run them with `pnpm exec node --test src/features/*/__tests__/*.test.mjs`.
  Do not install another runner just for a refactor. Keep new tests behavior-focused and nearby.
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
