# Tracksy styling migration

## Audit and implementation choices

Tracksy uses Nunito Sans, forest-green and teal tokens, soft shadows, gradients, native form
controls, and an in-app section navigator. The migration retains those values and the existing
`html[data-theme="dark"]` theme selector. Authentication, transport, query hooks, calculations,
and section navigation are outside this change.

- **Tailwind CSS v4:** `@tailwindcss/vite` is added alongside the existing React plugin.
  `shared/styles/tailwind.css` imports the theme and utilities without Preflight, preserving the
  existing reset, native controls, heading defaults, and font metrics. Semantic shadcn tokens
  reference the existing light/dark variables rather than introducing another palette.
- **Shared Button:** an owned shadcn-style Slot/CVA primitive provides Tracksy's existing variants.
  The existing public Button remains the loading/icon adapter, preserving all caller props.
- **Input, Label, Textarea, NativeSelect:** shared owned primitives remove repeated control surface
  declarations. Feature styles retain control dimensions, focus treatments, padding for icons and
  units, and CSS select arrows. Date/time pickers retain their specialized native implementations.
- **Card:** use the owned primitive only where a shared card surface is consumed. Preserve semantic
  `section`/`article` elements with `asChild`, and keep feature-specific gradients and spacing.
- **Dialogs and destructive confirmations:** migrate styling without replacing the existing
  implementations. Their close guards during requests, Escape/backdrop handling, portal placement,
  scroll locking, and mobile sizing remain in their owners. Installing Radix Dialog/AlertDialog
  would introduce behavior changes outside this styling migration.
- **Navigation and notifications:** preserve the current section buttons, mobile bottom bar,
  profile menu, and notification popover. A shadcn navigation/menu replacement would unnecessarily
  change interaction behavior and markup.
- **Charts, progress rings, milestones, tables and BMI disclosure:** remain custom. Recharts keeps
  its CSS variable colors and SVG styling. Native `details`/`summary` remains native; no Tabs,
  Accordion, Tooltip, or new chart library is needed.

Existing media queries remain at their exact pixel thresholds: 380, 420, 430, 460, 480, 520,
620, 640, 680, 760, 768, 900, 1050, and 1100px. Existing hover/pointer and reduced-motion queries
also remain. Tailwind's default screen sizes do not replace these breakpoints.

Co-located CSS uses Tailwind `@apply` where it preserves existing selector specificity and
cascade order. This keeps feature overrides stable while moving layout and typography to
Tailwind. Custom gradients, transforms, chart rules, native picker pseudo-elements, safe-area
expressions, and animation definitions stay in CSS. No legacy declaration is kept alongside an
equivalent utility for the same selector.

## Visual regression verification

Before changing styles, an isolated Vite harness rendered the real application components with
sanitized profile, shot, and weight fixtures seeded into TanStack Query. The harness substituted
throwing API/auth boundaries, blocked external browser requests, and never loaded real AWS
configuration or account data. It fixed time at 1 November 2026, 09:00 Europe/Stockholm, loaded
local Nunito Sans fonts, and used reduced motion for deterministic captures.

The screenshot matrix contains 52 cases: desktop (1440 × 1200) and mobile (390 × 844), dark and
light themes, and 13 UI states: Dashboard, Add Weight, Edit Goal, Shots, Add Shot, Weight,
Milestones, Profile, sign-in, sign-up, confirm account, profile setup, and delete confirmation.
Ordinary pages use full-height captures at the same responsive width; dialogs retain the exact
viewport dimensions. Comparisons decode PNG pixels when file bytes differ; layout dimension
changes fail the comparison. Each phase is compared with the original baseline.

The forms comparison exposed a later `font: inherit` override on the Add Shot textarea.
That override was preserved, and the affected four views were recaptured before proceeding.
Screenshots and fixtures belong to the isolated verification environment, not production code.

Additional baselines from an isolated snapshot of the original Git source cover expanded BMI
and treatment charts, the account menu, notifications, and shared UI states. The shared UI
fixture exercises all Button variants/colors, sizes, disabled/loading buttons, ViewAllButton,
error notices, loading indicators, and disabled profile controls. CSS animations in that fixture
are paused at the same frame for comparison. This adds 20 cases, for 72 final comparisons.

| Phase | Baseline comparisons | Result |
| --- | ---: | --- |
| Global tokens and Tailwind integration | 52 | Identical pixels |
| Shared Button | 52 | Identical pixels |
| Form controls, after restoring the textarea override | 52 | Identical pixels |
| Dialog styling | 52 | Identical pixels |
| Shared Card and card styling | 52 | Identical pixels |
| Navigation and app shell | 52 | Identical pixels |
| Auth feature | 12 | Identical pixels |
| Profile feature | 8 | Identical pixels |
| Shots feature | 8 | Identical pixels |
| Weight feature | 16 | Identical pixels |
| Milestones feature | 4 | Identical pixels |
| Dashboard feature | 12 | Identical pixels |
| Final feature/shared styles and cleanup | 72 | Identical pixels |

All final cases loaded their images and completed without browser runtime exceptions or external
application requests. Original media-query conditions were also checked against the source;
the two page layouts moved to JSX retain inclusive `max-width: 760px` variants.

Validation passed with pnpm 10.28.2: `pnpm install --frozen-lockfile`, `pnpm run lint`,
`pnpm run check`, `pnpm exec tsc -b`,
`pnpm exec node --test src/features/*/__tests__/*.test.mjs` (20 tests), and `pnpm run build`.
Vite reports a JavaScript chunk above its 500 kB warning threshold; no code-splitting or chart
library changes were introduced as part of this styling migration.

This verifies the specified Chrome viewports and fixture states, not every possible browser,
account state, or interaction. Existing layout quirks visible in the baseline are outside the
scope of this migration.

## Upstream documentation

- [Tailwind v4 Vite integration](https://tailwindcss.com/docs/installation/using-vite)
- [Tailwind's optional Preflight reset](https://tailwindcss.com/docs/preflight)
- [shadcn/ui in an existing Vite project](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui semantic theme variables](https://ui.shadcn.com/docs/theming)

`components.json` configures the manual existing-project shadcn setup. Add only primitives with
real consumers, then adapt their styles to Tracksy before use. Do not run an initializer that
replaces the theme, fonts, reset, or global CSS.
