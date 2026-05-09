import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_EMAIL = "demo@devstash.io"

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

  // 4. Demo user
  const demo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true, name: true, email: true, isPro: true, emailVerified: true },
  })
  if (!demo) {
    throw new Error(`Demo user not found (${DEMO_EMAIL}). Run: npx prisma db seed`)
  }
  console.log("\n✓ Demo user:")
  console.log(`  - ${demo.name} <${demo.email}> | isPro: ${demo.isPro} | verified: ${demo.emailVerified !== null}`)

  // 5. Demo user item counts
  const [demoItems, favoriteItems, pinnedItems] = await Promise.all([
    prisma.item.count({ where: { userId: demo.id } }),
    prisma.item.count({ where: { userId: demo.id, isFavorite: true } }),
    prisma.item.findMany({
      where: { userId: demo.id, isPinned: true },
      select: { title: true, itemType: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ])
  console.log("\n✓ Demo user items:")
  console.log(`  - Total:    ${demoItems}`)
  console.log(`  - Favorite: ${favoriteItems}`)
  console.log(`  - Pinned:   ${pinnedItems.length}`)
  for (const p of pinnedItems) {
    console.log(`      • [${p.itemType.name}] ${p.title}`)
  }

  // 6. Demo user collections with item composition
  const demoCollections = await prisma.collection.findMany({
    where: { userId: demo.id },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        select: { item: { select: { itemType: { select: { name: true } } } } },
      },
    },
  })
  console.log(`\n✓ Demo user collections (${demoCollections.length}):`)
  for (const c of demoCollections) {
    const breakdown = c.items.reduce<Record<string, number>>((acc, { item }) => {
      acc[item.itemType.name] = (acc[item.itemType.name] ?? 0) + 1
      return acc
    }, {})
    const summary = Object.entries(breakdown)
      .map(([name, n]) => `${n} ${name.toLowerCase()}${n === 1 ? "" : "s"}`)
      .join(", ")
    console.log(`  - ${c.name} (${c.items.length} items): ${summary || "empty"}`)
  }

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
