import { prisma } from "@/lib/db"

export type CollectionWithTypes = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  /** Ordered by frequency — index 0 is the most-used type (drives border color) */
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
  limit = 4
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  })

  return collections.map((col) => {
    // Count occurrences of each item type
    const typeCounts: Record<string, number> = {}
    const typeColors: Record<string, string> = {}
    const typeIcons: Record<string, string> = {}

    for (const { item } of col.items) {
      const { slug, color, icon } = item.itemType
      typeCounts[slug] = (typeCounts[slug] ?? 0) + 1
      typeColors[slug] = color
      typeIcons[slug] = icon
    }

    // Sort slugs by frequency descending (most-used first → border color)
    const typeSlugs = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([slug]) => slug)

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      typeSlugs,
      typeColors,
      typeIcons,
      createdAt: col.createdAt,
    }
  })
}

export async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ])

  return { totalCollections, favoriteCollections }
}
