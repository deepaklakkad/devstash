/**
 * One-time script to pin demo items in the existing database.
 * Run with: npx tsx scripts/patch-pinned.ts
 */
import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PINNED_TITLES = [
  "useDebounce & useLocalStorage Hooks",
  "Code Review Prompt",
]

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "demo@devstash.io" } })
  if (!user) throw new Error("Demo user not found")

  for (const title of PINNED_TITLES) {
    const updated = await prisma.item.updateMany({
      where: { userId: user.id, title },
      data: { isPinned: true },
    })
    console.log(`Pinned "${title}": ${updated.count} row(s) updated`)
  }

  console.log("✓ Done")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
