# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

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

### Dashboard Collections — Real Data — 2026-04-09

- Created `src/lib/db/collections.ts` with `getRecentCollections` and `getCollectionStats` functions
- Dashboard page converted to async server component fetching from Neon DB via Prisma
- Collection card border color derived from most-used item type in that collection
- Collection cards show icons for all item types present, colored per type
- Collections and Favorite Collections stats now show real counts from DB
- Demo user (demo@devstash.io) used as temporary auth until NextAuth is implemented

### Dashboard Items — Real Data — 2026-04-09

- Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemStats` functions
- All 5 data fetches (collections + items) run in a single `Promise.all`
- Item card icon and border color derived from real item type in DB
- Total Items and Favorite Items stats now show real counts from DB
- Pinned section only renders when pinned items exist
- Mock data fully removed from dashboard page
- Seeded two pinned items (useDebounce hook, Code Review Prompt) via `scripts/patch-pinned.ts`
- Updated `prisma/seed.ts` to mark those items as pinned for future reseeds
