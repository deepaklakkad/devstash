import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Testing database connection...\n")

  // 1. Connection check
  await prisma.$queryRaw`SELECT 1`
  console.log("✓ Connected to Neon PostgreSQL")

  // 2. System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  })
  console.log(`\n✓ System item types (${itemTypes.length}):`)
  for (const t of itemTypes) {
    console.log(`  - ${t.name} (${t.slug}) | ${t.color} | icon: ${t.icon}`)
  }

  // 3. Table counts
  const [users, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ])
  console.log("\n✓ Table counts:")
  console.log(`  - Users:       ${users}`)
  console.log(`  - Items:       ${items}`)
  console.log(`  - Collections: ${collections}`)
  console.log(`  - Tags:        ${tags}`)

  console.log("\n✓ All checks passed.")
}

main()
  .catch((e) => {
    console.error("✗ Database test failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
