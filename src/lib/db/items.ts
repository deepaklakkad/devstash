import { prisma } from "@/lib/db"

export type SidebarItemType = {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  itemCount: number
}

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

const ITEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"]

export async function getItemTypes(userId: string): Promise<SidebarItemType[]> {
  const [types, itemCounts] = await Promise.all([
    prisma.itemType.findMany({
      where: {
        OR: [{ isSystem: true }, { userId }],
      },
    }),
    userId
      ? prisma.item.groupBy({
          by: ["itemTypeId"],
          where: { userId },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ])

  const countMap = new Map(itemCounts.map((c) => [c.itemTypeId, c._count._all]))

  return types
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      icon: t.icon,
      color: t.color,
      itemCount: countMap.get(t.id) ?? 0,
    }))
    .sort((a, b) => {
      const ai = ITEM_TYPE_ORDER.indexOf(a.slug)
      const bi = ITEM_TYPE_ORDER.indexOf(b.slug)
      // Known types sort by defined order; unknown types go to the end
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
    })
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
