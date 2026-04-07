import { mockItemTypes } from "@/lib/mock-data"

interface Props {
  params: Promise<{ type: string }>
}

export default async function ItemTypePage({ params }: Props) {
  const { type } = await params
  const itemType = mockItemTypes.find((t) => t.slug === type)

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground capitalize">
        {itemType?.name ?? type}s
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Items of type &quot;{itemType?.name ?? type}&quot; will appear here.
      </p>
    </div>
  )
}
