# Current Feature

Codebase Audit — Quick Wins

## Status

In Progress

## Goals

Apply the low-risk findings from the 2026-05-12 codebase audit. Excludes the hardcoded demo-email finding (deferred until auth is wired in) and the larger refactors (sidebar/page component extraction, `items/[type]` mock-to-DB migration).

1. **Cap `getPinnedItems` query** — add a `take: 20` limit to `getPinnedItems` in `src/lib/db/items.ts` so a user who pins many items can't degrade dashboard performance. Existing `isPinned` index on `Item` already covers the query — no schema change needed.
2. **Deduplicate `getRecentCollections` query (N+1-style double-fetch)** — `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx` both call `getRecentCollections` on the same render (one with `limit: 3` for the sidebar, one with `limit: 4` for the main grid). Fix using standard Prisma + React conventions — no raw SQL. Preferred approach: fetch the larger set (limit 4) once in the layout and pass the result down as a prop to the page, slicing to 3 for the sidebar. Alternative: wrap `getRecentCollections` in React's `cache()` (from `react`) for per-request memoization, which keeps the Prisma call shape unchanged.
3. **Extract shared `iconMap`** — move the duplicated `iconMap` object (currently in both `src/app/dashboard/page.tsx` and `src/components/dashboard/dashboard-shell.tsx`) into a new `src/lib/icon-map.ts` and import from both consumers.
4. **Import `SidebarItemType` instead of re-declaring** — `src/components/dashboard/dashboard-shell.tsx` re-declares a structurally identical `SidebarItemType`. Replace with `import type { SidebarItemType } from "@/lib/db/items"`.
5. **Extract `PRO_ONLY_TYPE_SLUGS` constant** — the `slug === "file" || slug === "image"` check appears in 3 places (`layout.tsx` once as a filter, `dashboard-shell.tsx` once). Add `src/lib/item-types.ts` exporting `PRO_ONLY_TYPE_SLUGS` (a `Set`) and an `isProType(slug)` helper. Update both call sites.
6. **Use `col.types[0]?.color` directly + drop back-compat fields** — `src/app/dashboard/layout.tsx` (lines 37, 44) still uses `typeSlugs[0]` / `typeColors[…]` against `CollectionWithTypes`. Switch to `col.types[0]?.color`, then remove the now-unused `typeSlugs` / `typeColors` / `typeIcons` fields from `CollectionWithTypes` and from the mapper in `src/lib/db/collections.ts`.
7. **Switch seed system-types loop to `upsert`** — `prisma/seed.ts` lines ~30-37 use a `findFirst` + conditional `create` pattern. Replace with a single `prisma.itemType.upsert({ where: { slug_userId: { slug, userId: null } }, update: {}, create: type })` per type.

Out of scope:

- Replace hardcoded `demo@devstash.io` identity anchor (deferred — needs auth).
- Migrate `src/app/items/[type]/page.tsx` off `mockItemTypes` (separate feature; touches a different route).
- Delete unused exports in `src/lib/mock-data.ts` (leaving the file as-is per user direction).
- Extract `SidebarContent` sub-components and lift `StatCard` / `CollectionCard` / `ItemCard` out of `dashboard/page.tsx` (larger refactors, kept for a follow-up).

## Notes

- Each change should be small and independently verifiable; group them in a single branch but commit logically per concern if helpful.
- After every change, run `npm run build` and click through the dashboard in the browser before committing.
- For #2: stick to Prisma conventions — no raw SQL. The prop-passing fix is the simplest and keeps the layout as the single source of truth for the sidebar+page recents set.
- When dropping the back-compat fields (#6), grep for `typeSlugs`, `typeColors`, `typeIcons` to confirm no other consumers exist before removing.
- **Database / indexes:** none of the items above require schema or index changes. If that changes during implementation (e.g. a new index becomes useful), **always** add it via `npx prisma migrate dev --name <descriptive>` and commit the generated migration SQL — never `prisma db push`, never edit indexes only in `schema.prisma`. The dev Neon branch and prod branch must stay in sync via committed migrations.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial Next.js setup with Create Next App
- Added mock data (src/lib/mock-data.ts) and UI screenshots

### Dashboard UI Phase 1 — 2026-04-07

- shadcn/ui initialized with Tailwind v4
- Dashboard route at /dashboard
- Dark mode by default (Inter font)
- Top bar: search input, New Collection button, New Item button
- Sidebar: placeholder content, avatar (bottom-left), settings gear (bottom-right)

### Dashboard UI Phase 2 — 2026-04-07

- Collapsible sidebar (desktop) with panel toggle icon
- Item types (Snippets, Prompts, Commands, Notes, Links) as nav links to /items/[type]
- Favorite collections section in sidebar with item counts
- Recent collections section in sidebar with item counts
- User avatar + name + settings gear in sidebar footer
- Mobile sidebar always renders as a Sheet drawer (hamburger in topbar)

### Dashboard UI Phase 3 — 2026-04-07

- 4 stats cards (total items, collections, favorite items, favorite collections)
- Recent collections grid with left border color matching most frequent item type
- Collection cards show type icons for contained item types
- Pinned items section
- 10 most recent items as individual cards with colored left border per type
- Dashboard title and welcome subtitle
- Mock data dates updated to 2026 for realistic time-ago display

### Database Setup — Neon PostgreSQL + Prisma — 2026-04-09

- Prisma ORM v7 installed and configured with Neon PostgreSQL (serverless)
- Full schema created: User, Account, Session, VerificationToken, Item, ItemType, Collection, Tag, join tables
- Appropriate indexes and cascade deletes
- Initial migration applied
- 7 system item types seeded (snippet, prompt, command, note, file, image, link)

### Seed Data — 2026-04-09

- bcryptjs installed for password hashing
- Demo user seeded (demo@devstash.io / 12345678)
- 7 system item types seeded
- 5 collections with 14 items: React Patterns (3 snippets), AI Workflows (3 prompts), DevOps (1 snippet + 1 command + 2 links), Terminal Commands (4 commands), Design Resources (4 links)

### Dashboard Items — Real Data — 2026-04-09

- Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemStats` functions
- All 5 data fetches (collections + items) run in a single `Promise.all`
- Item card icon and border color derived from real item type in DB
- Total Items and Favorite Items stats now show real counts from DB
- Pinned section only renders when pinned items exist
- Mock data fully removed from dashboard page
- Seeded two pinned items (useDebounce hook, Code Review Prompt) via `scripts/patch-pinned.ts`
- Updated `prisma/seed.ts` to mark those items as pinned for future reseeds

### Stats & Sidebar — Real Data — 2026-04-09

- Added `getFavoriteCollections` to `src/lib/db/collections.ts`; extracted shared mapping helper to eliminate duplication
- Added `SidebarItemType` type and `getItemTypes` function to `src/lib/db/items.ts` with filtered per-user item counts
- Item types ordered by defined sequence: Snippets, Prompts, Commands, Notes, Files, Images, Links
- Dashboard layout made async to fetch sidebar data server-side and pass serializable props to the client shell
- Removed all mock data from `dashboard-shell.tsx`; sidebar now driven entirely by DB
- Favorite collections show a filled star icon (yellow)
- Recent collections show a colored circle based on the collection's most-used item type
- "View all collections" link added below the recents section, linking to `/collections`
- User name and avatar in sidebar footer sourced from DB user record

### Seed Data — Refresh from Spec — 2026-05-09

- Initial migration `20260408183431_init` applied to dev Neon branch via `prisma migrate dev`
- `prisma/seed.ts` made idempotent: clears the demo user's existing items and collections before re-seeding so `npx prisma db seed` is safe to re-run
- Seed contents already matched `context/features/seed-spec.md` exactly (demo user, 7 system types, 5 collections / 18 items, 2 pinned), so no content changes needed
- Verified by running `npx prisma db seed` twice — counts stayed at 5 collections / 18 items / 2 pinned

### Dashboard Collections — 2026-05-09

- Reshaped `CollectionWithTypes` around a single `types: CollectionTypePresence[]` array (sorted by frequency, carries slug/icon/color/count together); kept `typeSlugs/typeColors/typeIcons` as derived fields for back-compat with the dashboard layout/sidebar
- `CollectionCard` in dashboard page now reads from `col.types` directly, replacing three parallel-map lookups with one pass
- Added empty-`userId` short-circuits in `getRecentCollections`, `getFavoriteCollections`, `getCollectionStats` so unauthenticated/missing-user requests skip the DB
- `npm run build` passes (5/5 static pages)

### Dashboard Items — Spec Recheck — 2026-05-09

- Verified every goal in `dashboard-items-spec.md` was already satisfied by the earlier 2026-04-09 work: `src/lib/db/items.ts` exposes `getPinnedItems`/`getRecentItems`/`getItemStats`/`getItemTypes`; `src/app/dashboard/page.tsx` server-fetches all data via `Promise.all`, derives item-card icon/border from item type, renders tag badges, gates the Pinned section on `pinnedItems.length > 0`, and pulls stats from the DB
- Remaining `@/lib/mock-data` import is only in `src/app/items/[type]/page.tsx` (different route, outside this spec)
- No code changes needed; closed out without a feature branch

### Add Pro Badge to Sidebar — 2026-05-11

- Imported shadcn/ui `Badge` into `src/components/dashboard/dashboard-shell.tsx`
- Added `isPro = type.slug === "file" || type.slug === "image"` check in the sidebar item-types map
- For Files and Images rows, render a subtle secondary-variant `PRO` badge (`h-4 px-1.5 text-[10px] tracking-wider`) in the trailing slot instead of the item count
- All other item types keep the existing conditional count display unchanged; collapsed sidebar state is untouched
- `npm run build` passes
