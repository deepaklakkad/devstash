import { auth } from "@/auth"
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections"
import { getItemTypes } from "@/lib/db/items"
import { isProType } from "@/lib/item-types"
import DashboardShell from "@/components/dashboard/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id ?? ""

  const [allItemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getItemTypes(userId),
    getFavoriteCollections(userId, 5),
    getRecentCollections(userId, 4),
  ])

  // Exclude Pro-only types from sidebar nav
  const itemTypes = allItemTypes
    .filter((t) => !isProType(t.slug))
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
    primaryColor: col.types[0]?.color ?? null,
  }))

  const sidebarRecents = recentCollections.slice(0, 3).map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col.itemCount,
    primaryColor: col.types[0]?.color ?? null,
  }))

  return (
    <DashboardShell
      itemTypes={itemTypes}
      favoriteCollections={sidebarFavorites}
      recentCollections={sidebarRecents}
      userName={session?.user?.name ?? "User"}
      userEmail={session?.user?.email ?? null}
      userImage={session?.user?.image ?? null}
    >
      {children}
    </DashboardShell>
  )
}
