import { createFileRoute, Link } from '@tanstack/react-router'
import { getItemsFn } from '@/data/items'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ItemStatus } from '@/generated/prisma/enums'

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
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={item.ogImage}
                  alt={item.title || 'No title'}
                  className="h-full w-full object-cover group-hover:scale-105 transition-all"
                />
              </div>
            ) : (
              <div className="h-48 bg-slate-500">
                <p className="text-center text-slate-500">No image</p>
              </div>
            )}
            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === ItemStatus.COMPLETED
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {item.status.toLowerCase()}
                </Badge>
                <Button variant="outline" size="icon" className="size-8">
                  <Copy />
                </Button>
              </div>
              <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
              {item.author && (
                <p className="text-xs text-muted-foreground">{item.author}</p>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}
