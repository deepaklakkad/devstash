"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Code,
  File,
  FolderPlus,
  Image,
  Link as LinkIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  StickyNote,
  Sparkles,
  Terminal,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  mockCollections,
  mockFavoriteCollections,
  mockItems,
  mockItemTypes,
  mockUser,
} from "@/lib/mock-data"

const iconMap = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const

// Exclude Pro-only file/image types from sidebar nav
const navItemTypes = mockItemTypes.filter(
  (t) => t.slug !== "file" && t.slug !== "image"
)

// Item count per type id
const itemTypeCounts = mockItems.reduce<Record<string, number>>((acc, item) => {
  acc[item.itemTypeId] = (acc[item.itemTypeId] ?? 0) + 1
  return acc
}, {})

// 3 most recent collections by createdAt
const recentCollections = [...mockCollections]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 3)

const userInitials = mockUser.name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop aside and mobile Sheet)
// ---------------------------------------------------------------------------

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* ITEMS section */}
        {!collapsed && (
          <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
            Items
          </p>
        )}
        {navItemTypes.map((type) => {
          const Icon = iconMap[type.icon as keyof typeof iconMap] ?? Code
          const href = `/items/${type.slug}`
          const isActive = pathname === href

          return (
            <Link
              key={type.id}
              href={href}
              title={collapsed ? `${type.name}s` : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                isActive && "text-foreground bg-muted",
                collapsed && "justify-center"
              )}
            >
              <Icon
                className="size-4 shrink-0"
                style={{ color: type.color }}
              />
              {!collapsed && (
                <>
                  <span>{type.name}s</span>
                  {(itemTypeCounts[type.id] ?? 0) > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {itemTypeCounts[type.id]}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}

        {/* FAVORITES section */}
        {mockFavoriteCollections.length > 0 && (
          <>
            <Separator className="my-2" />
            {!collapsed && (
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                Favorites
              </p>
            )}
            {mockFavoriteCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                title={collapsed ? col.name : undefined}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  collapsed && "justify-center"
                )}
              >
                <span className="size-1.5 rounded-full bg-yellow-400 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{col.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {col.itemCount}
                    </span>
                  </>
                )}
              </Link>
            ))}
          </>
        )}

        {/* RECENT section — hidden when collapsed */}
        {!collapsed && recentCollections.length > 0 && (
          <>
            <Separator className="my-2" />
            <p className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
              Recent
            </p>
            {recentCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="truncate">{col.name}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {col.itemCount}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer: avatar + settings */}
      <div
        className={cn(
          "flex items-center border-t border-border px-3 py-2 shrink-0",
          collapsed ? "flex-col gap-2 px-2" : "justify-between"
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <Avatar className="size-7">
            <AvatarImage src={mockUser.image ?? undefined} />
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-sm text-foreground truncate max-w-28">
              {mockUser.name}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard Shell
// ---------------------------------------------------------------------------

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* Top Bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center gap-4 px-4 h-14 border-b border-border shrink-0">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </Button>

        {/* Logo — aligns with sidebar width on desktop */}
        <span
          className={cn(
            "font-semibold text-foreground text-sm tracking-tight shrink-0 transition-all duration-200",
            "hidden md:block",
            collapsed ? "w-12" : "w-48"
          )}
        >
          {collapsed ? "DS" : "DevStash"}
        </span>
        <span className="font-semibold text-foreground text-sm tracking-tight shrink-0 md:hidden">
          DevStash
        </span>

        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search collections..."
            className="pl-9 h-8 bg-muted/50 border-transparent focus-visible:border-border text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 hidden sm:flex">
            <FolderPlus className="size-4" />
            New Collection
          </Button>
          <Button size="sm" className="gap-1.5 h-8">
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar — Sheet/drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-border shrink-0 overflow-hidden transition-all duration-200",
            collapsed ? "w-14" : "w-52"
          )}
        >
          {/* Collapse toggle */}
          <div
            className={cn(
              "flex px-2 pt-2 pb-1",
              collapsed ? "justify-center" : "justify-end"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>

          <SidebarContent collapsed={collapsed} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
