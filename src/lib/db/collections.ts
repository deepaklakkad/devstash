import { prisma } from "@/lib/db"

export type CollectionTypePresence = {
  slug: string
  icon: string
  color: string
  count: number
}

export type CollectionWithTypes = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  /** Item types present in this collection, sorted most-frequent first. */
  types: CollectionTypePresence[]
  /** Convenience lookups kept for back-compat with existing consumers. */
  typeSlugs: string[]
  typeColors: Record<string, string>
  typeIcons: Record<string, string>
  createdAt: Date
}

export type CollectionStats = {
  totalCollections: number
  favoriteCollections: number
}

export async function getRecentCollections(
  userId: string,
  limit = 4,
): Promise<CollectionWithTypes[]> {
  if (!userId) return []

  const rows = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: collectionInclude,
  })

  return rows.map(shapeCollection)
}

export async function getFavoriteCollections(
  userId: string,
  limit = 5,
): Promise<CollectionWithTypes[]> {
  if (!userId) return []

  const rows = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: collectionInclude,
  })

  return rows.map(shapeCollection)
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  if (!userId) return { totalCollections: 0, favoriteCollections: 0 }

  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ])

  return { totalCollections, favoriteCollections }
}

const collectionInclude = {
  items: {
    include: {
      item: {
        select: {
          itemType: { select: { slug: true, icon: true, color: true } },
        },
      },
    },
  },
} as const

type RawCollection = Awaited<
  ReturnType<typeof prisma.collection.findMany<{ include: typeof collectionInclude }>>
>[number]

function shapeCollection(row: RawCollection): CollectionWithTypes {
  const presence = new Map<string, CollectionTypePresence>()

  for (const link of row.items) {
    const { slug, icon, color } = link.item.itemType
    const current = presence.get(slug)
    if (current) {
      current.count += 1
    } else {
      presence.set(slug, { slug, icon, color, count: 1 })
    }
  }

  const types = [...presence.values()].sort((a, b) => b.count - a.count)

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isFavorite: row.isFavorite,
    itemCount: row.items.length,
    types,
    typeSlugs: types.map((t) => t.slug),
    typeColors: Object.fromEntries(types.map((t) => [t.slug, t.color])),
    typeIcons: Object.fromEntries(types.map((t) => [t.slug, t.icon])),
    createdAt: row.createdAt,
  }
}
