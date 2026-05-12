---
name: DevStash Project Conventions (code-scanner)
description: Verified project conventions and false-positive triggers for DevStash codebase scans
type: project
---

Auth is intentionally not yet wired. Both `dashboard/layout.tsx` and `dashboard/page.tsx` use a hardcoded `demo@devstash.io` lookup as a temporary stand-in. Do NOT flag missing auth checks.

`.env*` is covered by `.gitignore` line 34. Do NOT report env exposure.

Tailwind v4 — CSS-based config in `src/app/globals.css` via `@theme`. No `tailwind.config.ts` exists or is needed.

`src/lib/mock-data.ts` is still alive (imported by `src/app/items/[type]/page.tsx`). Not dead code.

Pro-type slugs (`file`, `image`) identified by hardcoded string literals in three places — recurring duplication.

**Why:** Architectural decisions noted during first audit (May 2026).
**How to apply:** Skip false positives, focus on real issues.
