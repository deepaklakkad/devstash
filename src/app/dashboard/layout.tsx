import { prisma } from "@/lib/db"
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections"
import { getItemTypes } from "@/lib/db/items"
import DashboardShell from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporary: use demo user until auth is implemented
  const demoUser = await prisma.user.findUnique({ where: { email: "demo@devstash.io" } })
  const userId = demoUser?.id ?? ""

  const [allItemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getItemTypes(userId),
    getFavoriteCollections(userId, 5),
    getRecentCollections(userId, 3),
  ])

  // Exclude Pro-only types from sidebar nav
  const itemTypes = allItemTypes
    .filter((t) => t.slug !== "file" && t.slug !== "image")
    .map(({ id, name, slug, icon, color, itemCount }) => ({
      id,
      name,
      slug,
      icon,
      color,
      itemCount,
    }))

  const sidebarFavorites = favoriteCollections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col.itemCount,
    primaryColor: col.typeSlugs[0] ? (col.typeColors[col.typeSlugs[0]] ?? null) : null,
  }))

  const sidebarRecents = recentCollections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col.itemCount,
    primaryColor: col.typeSlugs[0] ? (col.typeColors[col.typeSlugs[0]] ?? null) : null,
  }))

  return (
    <DashboardShell
      itemTypes={itemTypes}
      favoriteCollections={sidebarFavorites}
      recentCollections={sidebarRecents}
      userName={demoUser?.name ?? "User"}
      userImage={demoUser?.image ?? null}
    >
      {children}
    </DashboardShell>
  )
}
