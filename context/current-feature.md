# Current Feature

<!-- Feature Name -->

Database Setup — Neon PostgreSQL + Prisma

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

- Set up Prisma ORM v7 with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Always create migrations (never use db push)
- Seed system item types

## Notes

- Use Prisma 7 (has breaking changes — read upgrade guide before implementing)
- We have a development branch (DATABASE_URL) and a production branch — always use migrations
- Seed data: 7 system item types (snippet, prompt, command, note, file, image, link)

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
