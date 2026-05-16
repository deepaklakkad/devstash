"use client"

import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { Menu } from "@base-ui/react/menu"
import { useTransition } from "react"

import { signOutAction } from "@/actions/auth"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"

type UserMenuProps = {
  name: string
  email: string | null
  image: string | null
  collapsed?: boolean
}

export function UserMenu({ name, email, image, collapsed }: UserMenuProps) {
  const [pending, startTransition] = useTransition()

  function onSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex items-center gap-2 rounded-md p-1 -m-1 text-left transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50",
          collapsed && "flex-col gap-0"
        )}
        aria-label="Open user menu"
      >
        <UserAvatar name={name} email={email} image={image} size="sm" />
        {!collapsed && (
          <span className="text-sm text-foreground truncate max-w-28">{name}</span>
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="start" sideOffset={6}>
          <Menu.Popup
            className={cn(
              "z-50 min-w-48 rounded-lg border border-border bg-popover text-popover-foreground",
              "p-1 shadow-md outline-none",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              "transition-opacity"
            )}
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground truncate">{name}</p>
              {email ? (
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              ) : null}
            </div>
            <div className="my-1 h-px bg-border" />
            <Menu.Item
              render={<Link href="/profile" />}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground",
                "outline-none data-[highlighted]:bg-muted cursor-pointer"
              )}
            >
              <User className="size-4 text-muted-foreground" />
              Profile
            </Menu.Item>
            <Menu.Item
              onClick={onSignOut}
              disabled={pending}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground",
                "outline-none data-[highlighted]:bg-muted cursor-pointer",
                "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
              )}
            >
              <LogOut className="size-4 text-muted-foreground" />
              {pending ? "Signing out..." : "Sign out"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
