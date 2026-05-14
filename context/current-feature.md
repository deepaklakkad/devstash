# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

## Goals

## Notes

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

### Codebase Audit — Quick Wins — 2026-05-12

- Capped `getPinnedItems` with a `take: 20` default limit (signature now takes an optional `limit`)
- Wrapped `getRecentCollections` in React's `cache()` so the layout + page share a single Prisma call per request; aligned both call sites to `limit=4` and sliced to 3 in the sidebar
- Extracted shared `iconMap` to `src/lib/icon-map.ts`; both `dashboard/page.tsx` and `dashboard-shell.tsx` now import it
- `dashboard-shell.tsx` now imports `SidebarItemType` from `@/lib/db/items` instead of re-declaring a structurally identical local copy
- Extracted `PRO_ONLY_TYPE_SLUGS` set + `isProType()` helper to `src/lib/item-types.ts`; replaced inline `slug === "file" || slug === "image"` checks in `layout.tsx` and `dashboard-shell.tsx`
- Dropped the `typeSlugs` / `typeColors` / `typeIcons` back-compat fields from `CollectionWithTypes` and the `shapeCollection` mapper; layout now reads `col.types[0]?.color` directly
- Switched `prisma/seed.ts` system-types loop from `findFirst` + conditional `create` to a single `prisma.itemType.upsert` against the `slug_userId` compound unique
- `npm run build` passes; `/dashboard` responds 200 with no runtime errors

### Auth Setup — NextAuth + GitHub Provider — 2026-05-14

- Installed `next-auth@5.0.0-beta.31` and `@auth/prisma-adapter@2.11.2`
- Split config: `src/auth.config.ts` (edge-safe — GitHub provider only) and `src/auth.ts` (Prisma adapter + `session: { strategy: "jwt" }` + `jwt`/`session` callbacks copying `token.sub` → `session.user.id`)
- NextAuth route handler at `src/app/api/auth/[...nextauth]/route.ts` destructures `{ GET, POST }` from `handlers`
- `src/proxy.ts` runs a separate edge-safe NextAuth instance (no Prisma adapter), redirects unauthenticated `/dashboard/*` requests to `/api/auth/signin?callbackUrl=...`; named `proxy` export with `config.matcher = ["/dashboard/:path*"]`
- `src/types/next-auth.d.ts` augments `Session.user` with `id: string`
- Uses NextAuth's default sign-in page (no custom `pages.signIn`)
- `.env` requires `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` (added to `.env.sample`)
- `npm run build` passes; Playwright confirmed `/dashboard` → `/api/auth/signin?callbackUrl=...` with **Sign in with GitHub** rendered; GitHub OAuth callback returned 302 (round-trip confirmed at the network level)
- Pre-existing Turbopack dev-mode quirk surfaced after the OAuth callback: `tailwindcss` resolved from the parent dir `...\code` instead of the project root. Not caused by this feature and does not affect production builds — tracked separately
