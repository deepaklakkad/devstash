export const mockUser = {
  id: "user_1",
  name: "Deepak Lakkad",
  email: "deepak@example.com",
  image: null,
  isPro: false,
}

export const mockItemTypes = [
  { id: "type_snippet", name: "Snippet",  slug: "snippet", icon: "Code",      color: "#3b82f6", isSystem: true },
  { id: "type_prompt",  name: "Prompt",   slug: "prompt",  icon: "Sparkles",  color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "Command",  slug: "command", icon: "Terminal",  color: "#f97316", isSystem: true },
  { id: "type_note",    name: "Note",     slug: "note",    icon: "StickyNote",color: "#fde047", isSystem: true },
  { id: "type_file",    name: "File",     slug: "file",    icon: "File",      color: "#6b7280", isSystem: true },
  { id: "type_image",   name: "Image",    slug: "image",   icon: "Image",     color: "#ec4899", isSystem: true },
  { id: "type_link",    name: "Link",     slug: "link",    icon: "Link",      color: "#10b981", isSystem: true },
]

export const mockCollections = [
  {
    id: "col_1",
    name: "Interview Prep",
    description: "DS&A problems and interview questions",
    isFavorite: true,
    itemCount: 12,
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "col_2",
    name: "React Patterns",
    description: "Common React patterns and best practices",
    isFavorite: false,
    itemCount: 8,
    createdAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "col_3",
    name: "Python Scripts",
    description: "Useful automation scripts",
    isFavorite: false,
    itemCount: 5,
    createdAt: "2024-03-10T00:00:00Z",
  },
  {
    id: "col_4",
    name: "Docker Clarity",
    description: "Docker commands and compose configs",
    isFavorite: false,
    itemCount: 3,
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "col_5",
    name: "AI Prompts",
    description: "Curated prompts for various AI tools",
    isFavorite: true,
    itemCount: 20,
    createdAt: "2024-03-20T00:00:00Z",
  },
  {
    id: "col_6",
    name: "API Documentation",
    description: "REST API notes and references",
    isFavorite: false,
    itemCount: 6,
    createdAt: "2024-03-22T00:00:00Z",
  },
]

export const mockItems = [
  {
    id: "item_1",
    title: "useDebounce Hook",
    description: "Custom React hook to debounce a value",
    contentType: "TEXT",
    content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["react", "hooks", "typescript"],
    createdAt: "2024-04-05T10:00:00Z",
    updatedAt: "2024-04-05T10:00:00Z",
  },
  {
    id: "item_2",
    title: "System Prompt Template",
    description: "Base system prompt for coding assistants",
    contentType: "TEXT",
    content: `You are an expert software engineer. You write clean, efficient, and well-documented code.

When given a task:
1. Understand the requirements fully before writing code
2. Consider edge cases and error handling
3. Write code that is readable and maintainable
4. Follow the existing code style and patterns`,
    language: null,
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_prompt",
    tags: ["ai", "system-prompt"],
    createdAt: "2024-04-04T09:00:00Z",
    updatedAt: "2024-04-04T09:00:00Z",
  },
  {
    id: "item_3",
    title: "Docker cleanup command",
    description: "Remove all stopped containers and unused images",
    contentType: "TEXT",
    content: `docker system prune -a --volumes -f`,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["docker", "devops"],
    createdAt: "2024-04-03T14:00:00Z",
    updatedAt: "2024-04-03T14:00:00Z",
  },
  {
    id: "item_4",
    title: "API Documentation Link",
    description: "Next.js App Router docs",
    contentType: "URL",
    content: null,
    url: "https://nextjs.org/docs/app",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tags: ["nextjs", "docs"],
    createdAt: "2024-04-02T11:00:00Z",
    updatedAt: "2024-04-02T11:00:00Z",
  },
  {
    id: "item_5",
    title: "Prisma upsert pattern",
    description: "Upsert with unique constraint in Prisma",
    contentType: "TEXT",
    content: `await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice' },
  create: { email: 'alice@example.com', name: 'Alice' },
})`,
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["prisma", "database"],
    createdAt: "2024-04-01T16:00:00Z",
    updatedAt: "2024-04-01T16:00:00Z",
  },
  {
    id: "item_6",
    title: "Git branch cleanup",
    description: "Delete all merged local branches",
    contentType: "TEXT",
    content: `git branch --merged | grep -v '\\*\\|main\\|master' | xargs git branch -d`,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["git"],
    createdAt: "2024-03-30T08:00:00Z",
    updatedAt: "2024-03-30T08:00:00Z",
  },
]

// Recent items — ordered by updatedAt desc (subset of mockItems)
export const mockRecentItems = mockItems.slice(0, 5)

// Favorite collections
export const mockFavoriteCollections = mockCollections.filter((c) => c.isFavorite)
