import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUser } from "@/lib/mock-data"
import { FolderPlus, Plus, Search, Settings } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initials = mockUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center gap-4 px-4 h-14 border-b border-border shrink-0">
        {/* Logo */}
        <span className="font-semibold text-foreground text-sm tracking-tight w-52 shrink-0">
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

        <div className="flex items-center gap-2 ml-auto">
          {/* New Collection Button */}
          <Button size="sm" variant="outline" className="gap-1.5 h-8">
            <FolderPlus className="size-4" />
            New Collection
          </Button>

          {/* New Item Button */}
          <Button size="sm" className="gap-1.5 h-8">
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-border flex flex-col overflow-hidden">
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-3">
            <h2 className="text-sm font-medium text-muted-foreground">Sidebar</h2>
          </div>

          {/* Sidebar footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border shrink-0">
            <Avatar className="size-7">
              <AvatarImage src={mockUser.image ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground">
              <Settings className="size-4" />
            </Button>
          </div>
        </aside>

        {/* Main */}
        {children}
      </div>
    </div>
  )
}
