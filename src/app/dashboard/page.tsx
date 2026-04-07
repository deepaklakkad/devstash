import Link from "next/link"
import {
  Code,
  File,
  FolderOpen,
  Image,
  Link as LinkIcon,
  Package,
  Pin,
  StickyNote,
  Sparkles,
  Star,
  Terminal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  mockCollections,
  mockFavoriteCollections,
  mockItems,
  mockItemTypes,
  mockUser,
} from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const iconMap = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const

const typeById = Object.fromEntries(mockItemTypes.map((t) => [t.id, t]))
const typeBySlug = Object.fromEntries(mockItemTypes.map((t) => [t.slug, t]))

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

const favoriteItems = mockItems.filter((i) => i.isFavorite)
const pinnedItems = mockItems.filter((i) => i.isPinned)

const recentCollections = [...mockCollections]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 4)

const recentItems = [...mockItems]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 10)

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${minutes}m ago`
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collection Card — left border color = most frequent type, icons for all types
// ---------------------------------------------------------------------------

function CollectionCard({
  col,
}: {
  col: (typeof mockCollections)[number]
}) {
  const primaryType = typeBySlug[col.typeSlugs[0]]
  const borderColor = primaryType?.color ?? "#6b7280"

  return (
    <Link
      href={`/collections/${col.id}`}
      className="block rounded-lg border border-border bg-card transition-colors hover:bg-muted/30 overflow-hidden"
      style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-foreground text-sm leading-snug">{col.name}</p>
          {col.isFavorite && (
            <Star className="size-3.5 text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
          )}
        </div>
        {col.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {col.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          {/* Type icons */}
          {col.typeSlugs.map((slug) => {
            const t = typeBySlug[slug]
            if (!t) return null
            const Icon = iconMap[t.icon as keyof typeof iconMap] ?? Code
            return (
              <Icon
                key={slug}
                className="size-3.5 shrink-0"
                style={{ color: t.color }}
              />
            )
          })}
          <span className="ml-auto text-xs text-muted-foreground">
            {col.itemCount} items
          </span>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Item Card — individual card with thick left border matching type color
// ---------------------------------------------------------------------------

function ItemCard({ item }: { item: (typeof mockItems)[number] }) {
  const type = typeById[item.itemTypeId]
  const Icon = type ? (iconMap[type.icon as keyof typeof iconMap] ?? Code) : Code
  const borderColor = type?.color ?? "#6b7280"

  return (
    <div
      className="rounded-lg border border-border bg-card overflow-hidden"
      style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <Icon className="size-4 shrink-0 mt-0.5" style={{ color: type?.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            {item.isPinned && <Pin className="size-3 text-muted-foreground shrink-0" />}
            {item.isFavorite && (
              <Star className="size-3 text-yellow-400 fill-yellow-400 shrink-0" />
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-4 font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
          {timeAgo(item.updatedAt)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {mockUser.name}
        </p>
      </div>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Items" value={mockItems.length} icon={Package} />
          <StatCard label="Collections" value={mockCollections.length} icon={FolderOpen} />
          <StatCard label="Favorite Items" value={favoriteItems.length} icon={Star} />
          <StatCard
            label="Favorite Collections"
            value={mockFavoriteCollections.length}
            icon={FolderOpen}
          />
        </div>
      </section>

      {/* Recent Collections */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">Recent Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-foreground mb-3">Pinned</h2>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Recent Items</h2>
          <span className="text-xs text-muted-foreground">{recentItems.length} items</span>
        </div>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
