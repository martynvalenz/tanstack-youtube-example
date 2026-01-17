import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getItemsFn } from '@/data/items'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Inbox } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ItemStatus } from '@/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { Suspense, use, useEffect, useState } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

const itemsSearchSchema = z.object({
  q: z.string().optional().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

export const Route = createFileRoute('/dashboard/items/')({
  head: () => ({
    meta: [
      {
        title: 'Saved Items',
      },
      {
        property: 'og:title',
        content: 'Saved Items',
      },
      {
        name: 'description',
        content: 'Manage your saved items and their status',
      },
      {
        property: 'og:description',
        content: 'Manage your saved items and their status',
      },
    ],
  }),
  loader: async () => ({ itemsPromise: getItemsFn() }),
  validateSearch: zodValidator(itemsSearchSchema),
  component: RouteComponent,
})

function ItemsList() {
  const { itemsPromise: data } = Route.useLoaderData()
  const { q, status } = Route.useSearch()
  const items = use(data)

  const filteredItems = items.filter((item) => {
    const matchesQuery =
      q === '' ||
      item.title?.toLowerCase().includes(q.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))

    const matchesStatus = status === 'all' || item.status === status
    return matchesQuery && matchesStatus
  })

  if (filteredItems.length === 0) {
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-secondary size-16">
            <Inbox className="size-12" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length === 0
              ? 'No items found'
              : 'No items match your search criteria'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length === 0
              ? 'Your library is empty. Start by adding items to your library.'
              : 'No items match your search criteria'}
          </EmptyDescription>
        </EmptyHeader>
        {items.length === 0 && (
          <EmptyContent>
            <Button asChild>
              <Link to="/dashboard/import">Add Items</Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredItems.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{ itemId: item.id }}
            className="block"
          >
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
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.preventDefault()
                    copyToClipboard(item.url)
                  }}
                >
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

function RouteComponent() {
  const { q, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    if (searchInput === q) return

    const timeoutId = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchInput }) })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInput, navigate, q])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">
          Manage your saved items and their status
        </p>
      </div>
      {/* Search and filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search items by title or tags..."
          className="max-w-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, status: value as typeof status }),
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {`${status.charAt(0).toUpperCase()}${status.slice(1).toLowerCase()}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={+index}
                className="group overflow-hidden transition-all hover:shadow-lg pt-0"
              >
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
              </Card>
            ))}
          </div>
        }
      >
        <ItemsList />
      </Suspense>
    </div>
  )
}
