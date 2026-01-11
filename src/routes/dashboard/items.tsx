import { createFileRoute, Link } from '@tanstack/react-router'
import { getItemsFn } from '@/data/items'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/items')({
  loader: async () => {
    const items = await getItemsFn()
    return items
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {data.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link to={`/dashboard`} className="block">
            {item.ogImage ? (
              <img
                src={item.ogImage}
                alt={item.title || 'No title'}
                className="h-full w-full object-cover group-hover:scale-105 transition-all"
              />
            ) : (
              <div className="h-48 bg-slate-500">
                <p className="text-center text-slate-500">No image</p>
              </div>
            )}
          </Link>
        </Card>
      ))}
    </div>
  )
}
