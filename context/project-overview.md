# DevStash

> **One hub for all your developer knowledge & resources.**

A modern SaaS platform that consolidates scattered developer essentials—code snippets, AI prompts, commands, notes, files, and links—into a single, fast, searchable, AI-enhanced workspace.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Features](#features)
- [Data Models](#data-models)
- [Tech Stack](#tech-stack)
- [Monetization](#monetization)
- [UI/UX Guidelines](#uiux-guidelines)
- [Type System](#type-system)
- [Architecture Diagram](#architecture-diagram)
- [API Routes](#api-routes)
- [Development Guidelines](#development-guidelines)

---

## Problem Statement

Developers keep their essentials scattered across multiple platforms:

| Resource | Current Location |
|----------|------------------|
| Code snippets | VS Code, Notion |
| AI prompts | Chat histories |
| Context files | Buried in projects |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Commands | `.txt` files, bash history |
| Templates | GitHub Gists |

**Result:** Context switching, lost knowledge, and inconsistent workflows.

**Solution:** DevStash provides ONE fast, searchable, AI-enhanced hub for all developer knowledge and resources.

---

## Target Users

| User Type | Description | Primary Use Cases |
|-----------|-------------|-------------------|
| 🧑‍💻 **Everyday Developer** | Needs quick access to resources | Grab snippets, prompts, commands, links |
| 🤖 **AI-first Developer** | Works heavily with AI tools | Save prompts, contexts, workflows, system messages |
| 📚 **Content Creator / Educator** | Creates educational content | Store code blocks, explanations, course notes |
| 🛠️ **Full-stack Builder** | Builds diverse applications | Collect patterns, boilerplates, API examples |

---

## Features

### A. Items & Item Types

Items are the core unit of DevStash. Each item has a **type** that determines its behavior and appearance.

**System Types** (immutable):

| Type | Content Type | Icon | Description |
|------|--------------|------|-------------|
| `snippet` | text | `Code` | Code snippets with syntax highlighting |
| `prompt` | text | `Sparkles` | AI prompts and system messages |
| `note` | text | `StickyNote` | Markdown notes and documentation |
| `command` | text | `Terminal` | CLI commands and scripts |
| `file` | file | `File` | File uploads *(Pro only)* |
| `image` | file | `Image` | Image uploads *(Pro only)* |
| `link` | url | `Link` | External URLs and bookmarks |

**URL Structure:** `/items/{type}` (e.g., `/items/snippets`, `/items/prompts`)

### B. Collections

Organize items into themed collections. Items can belong to multiple collections.

**Examples:**
- React Patterns → snippets, notes
- Context Files → files
- Python Snippets → snippets
- Interview Prep → snippets, notes, links

### C. Search

Full-text search across:
- ✅ Content
- ✅ Tags
- ✅ Titles
- ✅ Types

### D. Authentication

- 📧 Email/password
- 🐙 GitHub OAuth (via NextAuth v5)

### E. Core Features

| Feature | Description |
|---------|-------------|
| Favorites | Mark collections and items as favorites |
| Pin to Top | Pin important items for quick access |
| Recently Used | Track and display recently accessed items |
| Import Code | Import code from uploaded files |
| Markdown Editor | Rich editing for text-based types |
| File Upload | Upload files and images *(Pro)* |
| Export Data | Export as JSON/ZIP *(Pro)* |
| Dark Mode | Default theme (light mode optional) |
| Multi-collection | Add/remove items to/from multiple collections |
| Collection View | See which collections an item belongs to |

### F. AI Features *(Pro Only)*

| Feature | Description |
|---------|-------------|
| 🏷️ Auto-tag Suggestions | AI-powered tag recommendations |
| 📝 AI Summaries | Generate summaries of items |
| 💡 Explain This Code | AI code explanation |
| ⚡ Prompt Optimizer | Improve AI prompt effectiveness |

---

## Data Models

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER (extends NextAuth)
// ============================================

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String?   @unique
  emailVerified        DateTime?
  image                String?
  password             String?   // For email/password auth
  
  // Pro subscription
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  
  // Relations
  items                Item[]
  collections          Collection[]
  itemTypes            ItemType[]
  accounts             Account[]
  sessions             Session[]
  
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// ITEM
// ============================================

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  
  // Content
  contentType ContentType @default(TEXT)
  content     String?     @db.Text    // For text types
  url         String?                 // For link types
  
  // File storage (for file/image types)
  fileUrl     String?                 // Cloudflare R2 URL
  fileName    String?                 // Original filename
  fileSize    Int?                    // Size in bytes
  
  // Metadata
  language    String?                 // Programming language (for code)
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  itemTypeId  String
  itemType    ItemType @relation(fields: [itemTypeId], references: [id])
  
  tags        TagsOnItems[]
  collections ItemsOnCollections[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([itemTypeId])
  @@index([isFavorite])
  @@index([isPinned])
}

enum ContentType {
  TEXT
  FILE
  URL
}

// ============================================
// ITEM TYPE
// ============================================

model ItemType {
  id       String  @id @default(cuid())
  name     String
  slug     String
  icon     String
  color    String  // Hex color code
  isSystem Boolean @default(false)
  
  // Relations (null userId = system type)
  userId   String?
  user     User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  items    Item[]
  
  // Default type for collections
  defaultForCollections Collection[]
  
  @@unique([slug, userId])
  @@index([isSystem])
}

// ============================================
// COLLECTION
// ============================================

model Collection {
  id          String  @id @default(cuid())
  name        String
  description String? @db.Text
  isFavorite  Boolean @default(false)
  
  // Relations
  userId      String
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Default type for new items in this collection
  defaultTypeId String?
  defaultType   ItemType? @relation(fields: [defaultTypeId], references: [id])
  
  items       ItemsOnCollections[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([isFavorite])
}

// ============================================
// JOIN TABLES
// ============================================

model ItemsOnCollections {
  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  itemId       String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  collectionId String
  addedAt      DateTime   @default(now())

  @@id([itemId, collectionId])
  @@index([collectionId])
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  item   Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  itemId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@id([itemId, tagId])
  @@index([tagId])
}
```

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DevStash ERD                                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐
│    User     │       │  ItemType   │       │     Collection      │
├─────────────┤       ├─────────────┤       ├─────────────────────┤
│ id          │───┐   │ id          │───┐   │ id                  │
│ email       │   │   │ name        │   │   │ name                │
│ name        │   │   │ slug        │   │   │ description         │
│ isPro       │   │   │ icon        │   │   │ isFavorite          │
│ stripeId    │   │   │ color       │   │   │ defaultTypeId ──────┼──┐
└─────────────┘   │   │ isSystem    │   │   │ userId ─────────────┼──┼───┐
                  │   │ userId ─────┼───┼───│                     │  │   │
                  │   └─────────────┘   │   └─────────────────────┘  │   │
                  │                     │              │              │   │
                  │                     │              │              │   │
                  │   ┌─────────────┐   │   ┌──────────┴──────────┐  │   │
                  │   │    Item     │   │   │ ItemsOnCollections  │  │   │
                  │   ├─────────────┤   │   ├─────────────────────┤  │   │
                  │   │ id          │───┼───│ itemId              │  │   │
                  │   │ title       │   │   │ collectionId        │  │   │
                  │   │ content     │   │   │ addedAt             │  │   │
                  └───│ userId      │   │   └─────────────────────┘  │   │
                      │ itemTypeId ─┼───┘                            │   │
                      │ contentType │            ┌───────────────────┘   │
                      │ fileUrl     │            │                       │
                      │ isFavorite  │            │   ┌───────────────────┘
                      │ isPinned    │            │   │
                      └─────────────┘            │   │
                             │                   │   │
                             │                   │   │
                  ┌──────────┴──────────┐       │   │
                  │    TagsOnItems      │       │   │
                  ├─────────────────────┤       │   │
                  │ itemId              │       │   │
                  │ tagId ──────────────┼───┐   │   │
                  └─────────────────────┘   │   │   │
                                            │   │   │
                           ┌────────────────┘   │   │
                           │                    │   │
                      ┌────┴────┐               │   │
                      │   Tag   │               │   │
                      ├─────────┤               │   │
                      │ id      │               │   │
                      │ name    │               │   │
                      └─────────┘               │   │
                                                │   │
                                                ▼   ▼
                                        (FK relationships)
```

---

## Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | Full-stack React framework |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Latest | Type safety |

### Database & ORM

| Technology | Purpose |
|------------|---------|
| [Neon](https://neon.tech/) | Serverless PostgreSQL |
| [Prisma](https://www.prisma.io/) | ORM (v7) |
| Redis | Caching *(optional)* |

### Authentication

| Technology | Purpose |
|------------|---------|
| [NextAuth.js](https://authjs.dev/) | Authentication (v5) |

**Providers:**
- Email/password
- GitHub OAuth

### File Storage

| Technology | Purpose |
|------------|---------|
| [Cloudflare R2](https://www.cloudflare.com/products/r2/) | File & image uploads |

### AI Integration

| Technology | Model | Purpose |
|------------|-------|---------|
| [OpenAI](https://openai.com/) | gpt-5-nano | AI features (auto-tag, summaries, explain code, prompt optimizer) |

### Styling

| Technology | Purpose |
|------------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS (v4) |
| [shadcn/ui](https://ui.shadcn.com/) | Component library |

---

## Monetization

### Pricing Tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PRICING                                    │
├──────────────────────────────┬──────────────────────────────────────┤
│            FREE              │              PRO                      │
│           $0/mo              │     $8/mo or $72/year                │
├──────────────────────────────┼──────────────────────────────────────┤
│ ✓ 50 items total             │ ✓ Unlimited items                    │
│ ✓ 3 collections              │ ✓ Unlimited collections              │
│ ✓ System types (no file/img) │ ✓ File & Image uploads               │
│ ✓ Basic search               │ ✓ Custom types (coming soon)         │
│ ✗ No file/image uploads      │ ✓ AI auto-tagging                    │
│ ✗ No AI features             │ ✓ AI code explanation                │
│                              │ ✓ AI prompt optimizer                │
│                              │ ✓ Export data (JSON/ZIP)             │
│                              │ ✓ Priority support                   │
└──────────────────────────────┴──────────────────────────────────────┘
```

> **Development Note:** During development, all users can access everything. Pro restrictions will be enforced at launch.

---

## UI/UX Guidelines

### Design Principles

- **Modern & minimal** — Developer-focused aesthetic
- **Dark mode default** — Light mode optional
- **Clean typography** — Generous whitespace
- **Subtle borders and shadows** — Non-distracting
- **Syntax highlighting** — For all code blocks

### Design References

- [Notion](https://notion.so) — Clean organization
- [Linear](https://linear.app) — Minimal aesthetic
- [Raycast](https://raycast.com) — Fast, keyboard-first

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. User it as a reference:

- @context/screenshots/ui-dashboard.png
- @context/screenshots/ui-drawer.png

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  Logo    Search...                              [+] New   [Avatar] │
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                         │
│ ITEMS    │  Collections                                            │
│ ────────►│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ Snippets │  │ React    │ │ Python   │ │ AI       │               │
│ Prompts  │  │ Patterns │ │ Scripts  │ │ Prompts  │               │
│ Commands │  └──────────┘ └──────────┘ └──────────┘               │
│ Notes    │                                                         │
│ Links    │  Recent Items                                           │
│          │  ┌─────────────────────────────────────────────────┐   │
│ ──────── │  │ 🔵 useDebounce Hook              snippet  2h ago │   │
│          │  │ 🟣 System Prompt Template        prompt   1d ago │   │
│ COLLECTIONS │ 🟠 Docker cleanup command        command  2d ago │   │
│ ────────►│  │ 🟢 API Documentation Link        link     3d ago │   │
│ React... │  └─────────────────────────────────────────────────┘   │
│ Python.. │                                                         │
│ AI Pro.. │                                                         │
│          │                                                         │
└──────────┴─────────────────────────────────────────────────────────┘
                                │
                                ▼ (Click item to open drawer)
                    ┌───────────────────────┐
                    │  Item Detail Drawer   │
                    │  ─────────────────    │
                    │  Title: useDebounce   │
                    │  Type: Snippet        │
                    │  Tags: react, hooks   │
                    │  ───────────────────  │
                    │  ```typescript        │
                    │  function useDebounce │
                    │  ...                  │
                    │  ```                  │
                    └───────────────────────┘
```

### Responsive Behavior

- **Desktop:** Sidebar + main content (collapsible sidebar)
- **Mobile:** Sidebar becomes a drawer

### Micro-interactions

- ✨ Smooth transitions on all state changes
- 👆 Hover states on cards
- 🔔 Toast notifications for actions
- 💀 Loading skeletons during data fetching

---

## Type System

### System Types Configuration

| Type | Slug | Color | Icon | Content Type |
|------|------|-------|------|--------------|
| Snippet | `snippet` | `#3b82f6` (blue) | `Code` | text |
| Prompt | `prompt` | `#8b5cf6` (purple) | `Sparkles` | text |
| Command | `command` | `#f97316` (orange) | `Terminal` | text |
| Note | `note` | `#fde047` (yellow) | `StickyNote` | text |
| File | `file` | `#6b7280` (gray) | `File` | file |
| Image | `image` | `#ec4899` (pink) | `Image` | file |
| Link | `link` | `#10b981` (emerald) | `Link` | url |

### Seed Data

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const systemTypes = [
  { name: 'Snippet', slug: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { name: 'Prompt', slug: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { name: 'Command', slug: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { name: 'Note', slug: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'File', slug: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { name: 'Image', slug: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { name: 'Link', slug: 'link', icon: 'Link', color: '#10b981', isSystem: true },
]

async function main() {
  console.log('Seeding system item types...')
  
  for (const type of systemTypes) {
    await prisma.itemType.upsert({
      where: { slug_userId: { slug: type.slug, userId: null } },
      update: {},
      create: type,
    })
  }
  
  console.log('✓ Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DevStash Architecture                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                   ┌─────────────┐
                                   │   Client    │
                                   │  (Browser)  │
                                   └──────┬──────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Next.js 16 App                                  │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐ │
│  │   React 19 Pages   │  │    API Routes       │  │   Server Components  │ │
│  │   (Client-side)    │  │   /api/*            │  │   (SSR)              │ │
│  └────────────────────┘  └─────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
           │                        │                        │
           │                        ▼                        │
           │         ┌──────────────────────────┐            │
           │         │      NextAuth v5         │            │
           │         │  ┌─────────┬─────────┐   │            │
           │         │  │ Email/  │ GitHub  │   │            │
           │         │  │ Pass    │ OAuth   │   │            │
           │         │  └─────────┴─────────┘   │            │
           │         └──────────────────────────┘            │
           │                        │                        │
           ▼                        ▼                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              Data Layer                                     │
│                                                                             │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐ │
│   │   Prisma ORM    │──▶│  Neon Postgres  │   │   Cloudflare R2         │ │
│   │   (v7)          │   │  (Serverless)   │   │   (File Storage)        │ │
│   └─────────────────┘   └─────────────────┘   └─────────────────────────┘ │
│                                                                             │
│   ┌─────────────────┐   ┌─────────────────┐                                │
│   │   Redis         │   │   OpenAI API    │                                │
│   │   (Caching)     │   │   gpt-5-nano    │                                │
│   │   (Optional)    │   │   (AI Features) │                                │
│   └─────────────────┘   └─────────────────┘                                │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## API Routes

### Items

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/items` | List all items (with filters) |
| `GET` | `/api/items/:id` | Get single item |
| `POST` | `/api/items` | Create new item |
| `PATCH` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Delete item |
| `POST` | `/api/items/:id/favorite` | Toggle favorite |
| `POST` | `/api/items/:id/pin` | Toggle pin |

### Collections

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/collections` | List all collections |
| `GET` | `/api/collections/:id` | Get collection with items |
| `POST` | `/api/collections` | Create new collection |
| `PATCH` | `/api/collections/:id` | Update collection |
| `DELETE` | `/api/collections/:id` | Delete collection |
| `POST` | `/api/collections/:id/items` | Add items to collection |
| `DELETE` | `/api/collections/:id/items/:itemId` | Remove item from collection |

### Search

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/search?q=...` | Search across all content |

### AI *(Pro)*

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/ai/tags` | Generate tag suggestions |
| `POST` | `/api/ai/summary` | Generate item summary |
| `POST` | `/api/ai/explain` | Explain code |
| `POST` | `/api/ai/optimize-prompt` | Optimize prompt |

### Upload *(Pro)*

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/upload` | Upload file to R2 |
| `DELETE` | `/api/upload/:key` | Delete file from R2 |

---

## Development Guidelines

### Database Migrations

> ⚠️ **IMPORTANT:** Never use `db push` or directly update the database structure.

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Environment Variables

```env
# .env.local

# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="devstash-uploads"

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
```

### Recommended Extensions (VS Code)

- Prisma
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- TypeScript + JavaScript

### Useful Links

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| NextAuth.js Docs | https://authjs.dev |
| Tailwind CSS Docs | https://tailwindcss.com/docs |
| shadcn/ui Docs | https://ui.shadcn.com |
| Cloudflare R2 Docs | https://developers.cloudflare.com/r2 |
| Neon Docs | https://neon.tech/docs |
| OpenAI API Docs | https://platform.openai.com/docs |
| Stripe Docs | https://stripe.com/docs |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | - | Initial project specification |

---

<p align="center">
  <strong>DevStash</strong> — Your developer knowledge hub.<br>
  Built with ❤️ for developers, by developers.
</p>
