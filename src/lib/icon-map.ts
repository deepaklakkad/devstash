import {
  Code,
  File,
  Image,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react"

export const iconMap = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
} as const

export type IconName = keyof typeof iconMap
