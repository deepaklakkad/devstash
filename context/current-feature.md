# Current Feature

<!-- Feature Name -->

Seed Data

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

- Create `prisma/seed.ts` to populate the database with sample data for development and demos
- Seed a demo user (demo@devstash.io, password hashed with bcryptjs 12 rounds)
- Seed 7 system item types (snippet, prompt, command, note, file, image, link)
- Seed 5 collections with realistic items

## Notes

### Demo User

- **Email:** demo@devstash.io
- **Name:** Demo User
- **Password:** 12345678 (bcryptjs, 12 rounds)
- **isPro:** false
- **emailVerified:** current date

### System Item Types

| Name    | Icon       | Color   |
| ------- | ---------- | ------- |
| snippet | Code       | #3b82f6 |
| prompt  | Sparkles   | #8b5cf6 |
| command | Terminal   | #f97316 |
| note    | StickyNote | #fde047 |
| file    | File       | #6b7280 |
| image   | Image      | #ec4899 |
| link    | Link       | #10b981 |

All types have `isSystem: true`.

### Collections & Items

#### React Patterns
_Description: Reusable React patterns and hooks_
- 3 snippets (TypeScript): useDebounce/useLocalStorage hooks, Context provider / compound component pattern, utility functions

#### AI Workflows
_Description: AI prompts and workflow automations_
- 3 prompts: code review prompt, documentation generation prompt, refactoring assistance prompt

#### DevOps
_Description: Infrastructure and deployment resources_
- 1 snippet (Docker / CI/CD config)
- 1 command (deployment script)
- 2 links (real documentation URLs)

#### Terminal Commands
_Description: Useful shell commands for everyday development_
- 4 commands: git operations, docker commands, process management, package manager utilities

#### Design Resources
_Description: UI/UX resources and references_
- 4 links (real URLs): CSS/Tailwind reference, component library, design system, icon library

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
