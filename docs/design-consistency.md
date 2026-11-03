# Design consistency inventory

The Dashboard is the visual reference. This audit covers Dashboard, Shots, Weight,
Milestones, Profile, auth screens, shared primitives, and entry/confirmation dialogs.
Tailwind v4 and the existing owned shadcn/ui primitives are already configured;
no framework or dependency changes are needed.

| Pattern | Finding | Consolidation |
| --- | --- | --- |
| Page headers | Shared header already supports greeting, eyebrow, description, metadata and action; Profile and Milestones use different title conventions. | Keep PageHeader and use the requested titles. |
| Page layout | Per-page desktop gaps differ (20/22px); content widths were previously aligned with Dashboard. | Share Dashboard's 22px desktop / 16px mobile page rhythm; preserve feature grids and current widths. |
| Histories | Shots and Weight duplicate card headers, empty states, month groups, delete controls and list surfaces; full rows differ in height, type, and spacing. | Share presentation components and align full-history sizing. Keep ordering, grouping, pagination counts, units and deletion state in their features. |
| Expandable panels | Treatment statistics and BMI duplicate the same native details/summary structure and responsive rules. | Share CollapsibleCard; retain native keyboard behavior and feature-owned chart content. |
| Typography | Repeated equivalent card headings; measurement and dosage values lack a common numeric treatment. | Use shared history typography and tabular numeric measurements. Retain Dashboard's hierarchy and intentional metric sizes. |
| Copy | Title case and naming vary (Add Weight, Add Shot, Recent Weights, All Milestones, Profile Settings). | Use sentence case, Measurements, Injection history, Weight change, Your milestones and Your profile. |
| Forms/dialogs | Shared Input, NativeSelect, Label, DateField, TimeField, Button and ConfirmDialog already exist. Entry forms duplicate their presentation rules. | Reuse existing primitives and share repeated entry-dialog styles. Keep validation, fields, focus management and submission logic. |
| Milestones | Completed, upcoming and locked states already use semantic colors and preserve dynamic 5kg achievements. Progress tracks repeat presentation. | Keep calculations, state distinctions and the existing grouped progress styles; align heading/helper typography. |
| Tokens | Global theme variables already own palette, radii and shadows. Chart category colors carry domain meaning. | Reuse existing semantic tokens; preserve chart colors and feature accent distinctions. |
| Navigation/loading | Navigation is centralized in DashboardShell; query loading/error behavior belongs to the shell. | Retain existing navigation, auth and query behavior. No extra generic state framework. |

Visual evidence and browser checks use an isolated temporary app with sanitized
TanStack Query data and disabled API/auth transport. No demo code enters production.

## Verification

- Captured and compared 52 matching desktop/mobile states in both themes, including
  all five pages, entry/deletion dialogs, expanded statistics panels and empty histories.
- Dashboard pixel differences are confined to the explicitly requested eyebrow text;
  its composition, chart, colors and spacing are unchanged from the captured baseline.
- Checked all five pages at 320, 390, 768, 1024, 1440, 1920 and 2560px in both themes.
  Shared page widths, spacing and history proportions match, without horizontal overflow.
- Passed 416 browser assertions, including pagination, keyboard disclosure, Escape
  cancellation, confirmation/loading states, validation and mock CRUD/profile submissions.
  No browser runtime exceptions occurred in the completed run. These checks use local
  mock transport and do not verify deployed AWS services.
- All 25 Node tests pass, including rendered shared-component/BMI coverage and the
  existing milestone, history, scheduling and unit-conversion tests.
- Lint, Biome, TypeScript and production build pass. Vite retains its existing warning
  about a JavaScript chunk exceeding 500kB.

Run the complete available checks with pnpm:

```sh
pnpm run lint
pnpm run check
pnpm exec node --test src/features/*/__tests__/*.test.mjs src/shared/components/__tests__/*.test.mjs
pnpm run build
```

`build` includes the TypeScript project check. Temporary browser/demo tooling is
removed after verification; it is not part of the application or committed changes.
