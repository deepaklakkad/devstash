import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function getInitials(name: string | null | undefined, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "U"
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type UserAvatarProps = {
  name?: string | null
  email?: string | null
  image?: string | null
  size?: "sm" | "default" | "lg"
  className?: string
}

export function UserAvatar({ name, email, image, size = "default", className }: UserAvatarProps) {
  const initials = getInitials(name, email)
  return (
    <Avatar size={size} className={cn(className)}>
      {image ? <AvatarImage src={image} alt={name ?? email ?? "User"} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
