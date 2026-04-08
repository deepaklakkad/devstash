import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const systemTypes = [
  { name: "Snippet", slug: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "Prompt", slug: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "Command", slug: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "Note", slug: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "File", slug: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "Image", slug: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "Link", slug: "link", icon: "Link", color: "#10b981", isSystem: true },
]

async function main() {
  console.log("Seeding system item types...")

  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { slug: type.slug, userId: null },
    })
    if (!existing) {
      await prisma.itemType.create({ data: type })
    }
  }

  console.log("✓ Seeding complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
