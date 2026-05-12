---
name: DevStash Project Conventions
description: Verified project conventions and false-positive triggers for the DevStash codebase audit
type: project
---

Auth is intentionally not yet wired up. Both `dashboard/layout.tsx` and `dashboard/page.tsx` use a hardcoded `demo@devstash.io` lookup as a temporary stand-in. Do NOT flag missing auth checks — the project is pre-auth.

`.env*` is covered by `.gitignore` — verified line 34 (`env files`). Do NOT report env exposure.

Tailwind v4 is used with CSS-based config in `src/app/globals.css` via `@theme`. No `tailwind.config.ts` exists or is needed.

No test framework is in use — this is intentional per `ai-interaction.md`.

The `src/lib/mock-data.ts` file is still alive: it is actively imported by `src/app/items/[type]/page.tsx`. It is NOT dead code — but the `mockCollections`, `mockItems`, `mockRecentItems`, and `mockFavoriteCollections` exports are unused. Only `mockItemTypes` is consumed.

Pro-type slugs (`file`, `image`) are identified by hardcoded string comparisons in three separate places: `dashboard/layout.tsx:23`, `dashboard-shell.tsx:118`, and the sidebar filter in layout.tsx. This is a recurring duplication pattern.

The `iconMap` constant mapping icon-name strings to Lucide components is duplicated identically in `dashboard/page.tsx` (L25-33) and `dashboard-shell.tsx` (L65-73). Should be extracted to a shared lib.

The `SidebarItemType` type is declared identically in both `src/lib/db/items.ts` and `src/components/dashboard/dashboard-shell.tsx`. The shell re-declares it locally instead of importing the exported type.

Dynamic `style=` props for hex colors (borderLeftColor, color, backgroundColor) are used intentionally in dashboard components for DB-sourced hex values that cannot be expressed as static Tailwind classes. This is a legitimate exception to the no-inline-styles rule — do not flag.

`getRecentCollections` is called twice per page navigation: once in `layout.tsx` (limit 3, sidebar) and once in `page.tsx` (limit 4, main grid). Different limits so cannot be trivially unified, but both trigger a DB query.

Seed script (`prisma/seed.ts` L30-37) issues up to 14 sequential DB queries for 7 system types (findFirst + optional create per type). This is seeding only, not runtime — low priority.

No Server Actions, API routes, or user-facing mutations exist yet. Do not flag missing Zod validation or CSRF protection.

`DATABASE_URL!` non-null assertion in `src/lib/db.ts:7` is intentional — startup should crash if env var is absent.

**Why:** Full codebase audit run on 2026-05-12. All findings verified against actual file contents.
**How to apply:** Use these facts to avoid false positives in future audit sessions. Update when new features are added.
