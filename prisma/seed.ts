import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ============================================
// SYSTEM ITEM TYPES
// ============================================

const systemTypes = [
  { name: "Snippet", slug: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "Prompt", slug: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "Command", slug: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "Note", slug: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "File", slug: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "Image", slug: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "Link", slug: "link", icon: "Link", color: "#10b981", isSystem: true },
]

async function main() {
  // ============================================
  // SYSTEM ITEM TYPES
  // ============================================

  console.log("Seeding system item types...")

  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { slug: type.slug, userId: null },
    })
    if (!existing) {
      await prisma.itemType.create({ data: type })
    }
  }

  // ============================================
  // DEMO USER
  // ============================================

  console.log("Seeding demo user...")

  const hashedPassword = await bcrypt.hash("12345678", 12)

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  })

  // ============================================
  // FETCH TYPE IDs
  // ============================================

  const types = await prisma.itemType.findMany({ where: { isSystem: true } })
  const typeMap = Object.fromEntries(types.map((t) => [t.slug, t.id]))

  // ============================================
  // COLLECTION: React Patterns
  // ============================================

  console.log("Seeding collection: React Patterns...")

  const reactPatterns = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      defaultTypeId: typeMap.snippet,
    },
  })

  const reactItems = await prisma.item.createManyAndReturn({
    data: [
      {
        title: "useDebounce & useLocalStorage Hooks",
        description: "Common custom hooks for debouncing values and persisting state in localStorage.",
        contentType: "TEXT",
        language: "typescript",
        content: `import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
      {
        title: "Context Provider & Compound Component Pattern",
        description: "Scalable state sharing using React Context with compound component composition.",
        contentType: "TEXT",
        language: "typescript",
        content: `import { createContext, useContext, useState, ReactNode } from "react"

// --- Context Provider Pattern ---
interface ThemeContextValue {
  theme: "light" | "dark"
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}

// --- Compound Component Pattern ---
interface CardProps { children: ReactNode }

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>
}

Card.Header = function CardHeader({ children }: CardProps) {
  return <div className="card-header">{children}</div>
}

Card.Body = function CardBody({ children }: CardProps) {
  return <div className="card-body">{children}</div>
}

export { Card }`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
      {
        title: "Common React Utility Functions",
        description: "Handy utilities: cn() class merger, formatRelativeTime, and truncate.",
        contentType: "TEXT",
        language: "typescript",
        content: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date as relative time (e.g. "2 hours ago") */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return \`\${minutes}m ago\`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return \`\${hours}h ago\`
  const days = Math.floor(hours / 24)
  return \`\${days}d ago\`
}

/** Truncate a string to a max length */
export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 1) + "…"
}`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
    ],
  })

  await prisma.itemsOnCollections.createMany({
    data: reactItems.map((item) => ({ itemId: item.id, collectionId: reactPatterns.id })),
  })

  // ============================================
  // COLLECTION: AI Workflows
  // ============================================

  console.log("Seeding collection: AI Workflows...")

  const aiWorkflows = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
      defaultTypeId: typeMap.prompt,
    },
  })

  const aiItems = await prisma.item.createManyAndReturn({
    data: [
      {
        title: "Code Review Prompt",
        description: "Thorough code review prompt for PRs and code changes.",
        contentType: "TEXT",
        content: `You are an expert software engineer performing a code review. Review the following code and provide structured feedback.

## What to check:
1. **Correctness** — Does the logic work? Are there edge cases or bugs?
2. **Security** — SQL injection, XSS, auth bypasses, exposed secrets?
3. **Performance** — N+1 queries, unnecessary re-renders, blocking operations?
4. **Readability** — Is it easy to understand? Are names descriptive?
5. **Patterns** — Does it follow the existing codebase conventions?

## Output format:
- **Critical** (must fix before merge)
- **Suggestion** (non-blocking improvements)
- **Nitpick** (minor style preferences)

Code to review:
\`\`\`
{CODE}
\`\`\``,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
      {
        title: "Documentation Generation Prompt",
        description: "Generate clear, developer-friendly documentation from code or specs.",
        contentType: "TEXT",
        content: `You are a technical writer. Generate clear, concise documentation for the following code/feature.

## Requirements:
- Write for developers who are new to this codebase
- Include: Overview, Parameters/Props, Return values, Usage examples
- Keep it practical — focus on what a developer needs to use this, not implementation details
- Use markdown formatting with code blocks

## Output sections:
1. **Overview** (1-2 sentences)
2. **Signature / Interface** (TypeScript types if applicable)
3. **Parameters** (table format)
4. **Returns**
5. **Examples** (2-3 realistic usage examples)
6. **Notes / Caveats** (optional)

Code/Feature to document:
\`\`\`
{CODE_OR_FEATURE}
\`\`\``,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
      {
        title: "Refactoring Assistance Prompt",
        description: "Prompt for guided refactoring with clear goals and constraints.",
        contentType: "TEXT",
        content: `You are a senior engineer helping refactor code. Your goal is to improve the code while preserving its behavior.

## Refactoring goals (check which apply):
- [ ] Reduce complexity / simplify logic
- [ ] Improve readability and naming
- [ ] Extract reusable functions or components
- [ ] Remove duplication (DRY)
- [ ] Improve performance
- [ ] Add proper TypeScript types

## Constraints:
- Do NOT change external behavior or API contracts
- Do NOT add features not already present
- Keep changes minimal and focused
- Explain each significant change with a comment

## Code to refactor:
\`\`\`
{CODE}
\`\`\`

Provide the refactored version with a brief summary of changes made.`,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
    ],
  })

  await prisma.itemsOnCollections.createMany({
    data: aiItems.map((item) => ({ itemId: item.id, collectionId: aiWorkflows.id })),
  })

  // ============================================
  // COLLECTION: DevOps
  // ============================================

  console.log("Seeding collection: DevOps...")

  const devops = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
      defaultTypeId: typeMap.snippet,
    },
  })

  const devopsItems = await prisma.item.createManyAndReturn({
    data: [
      {
        title: "Docker + GitHub Actions CI/CD",
        description: "Dockerfile and GitHub Actions workflow for building and pushing a Node.js app to Docker Hub.",
        contentType: "TEXT",
        language: "dockerfile",
        content: `# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

---
# .github/workflows/docker.yml
name: Build & Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: \${{ secrets.DOCKER_USERNAME }}/myapp:latest`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
      {
        title: "Deploy to Production",
        description: "SSH into server, pull latest Docker image, and restart the container.",
        contentType: "TEXT",
        content: `ssh deploy@\${SERVER_IP} "
  docker pull \${DOCKER_USERNAME}/myapp:latest &&
  docker stop myapp || true &&
  docker rm myapp || true &&
  docker run -d --name myapp \\
    --restart unless-stopped \\
    -p 3000:3000 \\
    --env-file /etc/myapp/.env \\
    \${DOCKER_USERNAME}/myapp:latest
"`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
      {
        title: "Neon PostgreSQL Docs",
        description: "Official Neon documentation — serverless PostgreSQL branching, connections, and migrations.",
        contentType: "URL",
        url: "https://neon.tech/docs/introduction",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
      {
        title: "Docker Documentation",
        description: "Official Docker docs — get started guides, Dockerfile reference, and Compose.",
        contentType: "URL",
        url: "https://docs.docker.com",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    ],
  })

  await prisma.itemsOnCollections.createMany({
    data: devopsItems.map((item) => ({ itemId: item.id, collectionId: devops.id })),
  })

  // ============================================
  // COLLECTION: Terminal Commands
  // ============================================

  console.log("Seeding collection: Terminal Commands...")

  const terminalCommands = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      defaultTypeId: typeMap.command,
    },
  })

  const terminalItems = await prisma.item.createManyAndReturn({
    data: [
      {
        title: "Git — Undo & Clean",
        description: "Undo last commit, unstage files, discard changes, and clean untracked files.",
        contentType: "TEXT",
        content: `# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# Unstage a file
git restore --staged <file>

# Discard all local changes
git checkout .

# Delete all untracked files and directories
git clean -fd

# Interactively stash specific changes
git stash push -p

# Show stash list and apply a specific stash
git stash list
git stash apply stash@{2}`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
      {
        title: "Docker — Container & Image Management",
        description: "Stop, remove, and prune Docker containers and images.",
        contentType: "TEXT",
        content: `# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes -f

# Follow logs for a container
docker logs -f <container_name>

# Open a shell in a running container
docker exec -it <container_name> sh`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
      {
        title: "Process Management",
        description: "Find and kill processes by port or name.",
        contentType: "TEXT",
        content: `# Find process using a specific port (macOS/Linux)
lsof -i :<port>

# Kill process by PID
kill -9 <pid>

# Kill all processes matching a name
pkill -f <process_name>

# Windows: find process using a port
netstat -ano | findstr :<port>

# Windows: kill process by PID
taskkill /PID <pid> /F`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
      {
        title: "npm / pnpm Utilities",
        description: "Useful package manager commands for auditing, cleaning, and updating deps.",
        contentType: "TEXT",
        content: `# Check for outdated packages
npm outdated

# Update all packages to latest (respecting semver)
npm update

# Audit and auto-fix vulnerabilities
npm audit fix

# Remove node_modules and reinstall cleanly
rm -rf node_modules package-lock.json && npm install

# List globally installed packages
npm list -g --depth=0

# Check what a package exports (pnpm)
pnpm why <package_name>`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    ],
  })

  await prisma.itemsOnCollections.createMany({
    data: terminalItems.map((item) => ({ itemId: item.id, collectionId: terminalCommands.id })),
  })

  // ============================================
  // COLLECTION: Design Resources
  // ============================================

  console.log("Seeding collection: Design Resources...")

  const designResources = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
      defaultTypeId: typeMap.link,
    },
  })

  const designItems = await prisma.item.createManyAndReturn({
    data: [
      {
        title: "Tailwind CSS Docs",
        description: "Official Tailwind CSS documentation — utility classes, configuration, and v4 migration guide.",
        contentType: "URL",
        url: "https://tailwindcss.com/docs",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
      {
        title: "shadcn/ui Components",
        description: "Beautifully designed, accessible components built with Radix UI and Tailwind CSS.",
        contentType: "URL",
        url: "https://ui.shadcn.com/docs/components",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
      {
        title: "Radix UI Primitives",
        description: "Unstyled, accessible UI primitives for building high-quality design systems.",
        contentType: "URL",
        url: "https://www.radix-ui.com/primitives",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
      {
        title: "Lucide Icons",
        description: "Open-source icon library with 1000+ consistent, beautiful SVG icons.",
        contentType: "URL",
        url: "https://lucide.dev/icons",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    ],
  })

  await prisma.itemsOnCollections.createMany({
    data: designItems.map((item) => ({ itemId: item.id, collectionId: designResources.id })),
  })

  console.log("✓ Seeding complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
