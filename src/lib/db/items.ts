import { prisma } from "@/lib/db"

export type ItemWithType = {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  updatedAt: Date
  tags: string[]
  itemType: {
    slug: string
    icon: string
    color: string
  }
}

export type ItemStats = {
  totalItems: number
  favoriteItems: number
}

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: {
      itemType: { select: { slug: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  })

  return items.map(toItemWithType)
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithType[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      itemType: { select: { slug: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  })

  return items.map(toItemWithType)
}

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ])

  return { totalItems, favoriteItems }
}

// ---------------------------------------------------------------------------
// Internal mapper
// ---------------------------------------------------------------------------

type PrismaItem = Awaited<ReturnType<typeof prisma.item.findMany<{
  include: {
    itemType: { select: { slug: true; icon: true; color: true } }
    tags: { include: { tag: { select: { name: true } } } }
  }
}>>>[number]

function toItemWithType(item: PrismaItem): ItemWithType {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    updatedAt: item.updatedAt,
    tags: item.tags.map((t) => t.tag.name),
    itemType: {
      slug: item.itemType.slug,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
  }
}
