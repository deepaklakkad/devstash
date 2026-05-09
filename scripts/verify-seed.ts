import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "demo@devstash.io" } })
  if (!user) {
    console.log("No demo user found")
    return
  }

  const collections = await prisma.collection.count({ where: { userId: user.id } })
  const items = await prisma.item.count({ where: { userId: user.id } })
  const pinned = await prisma.item.count({ where: { userId: user.id, isPinned: true } })
  const types = await prisma.itemType.count({ where: { isSystem: true } })

  const byCollection = await prisma.collection.findMany({
    where: { userId: user.id },
    select: { name: true, _count: { select: { items: true } } },
  })

  console.log({ systemTypes: types, collections, items, pinned })
  console.log("Items per collection:", byCollection.map((c) => `${c.name}: ${c._count.items}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
