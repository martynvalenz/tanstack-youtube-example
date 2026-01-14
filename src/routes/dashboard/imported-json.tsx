import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { getImportedJsonFn } from '@/data/improt-json'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'

export const Route = createFileRoute('/dashboard/imported-json')({
  loader: async () => {
    const data = await getImportedJsonFn()
    return {
      products: data.products,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { products } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Imported JSON</h1>
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Item key={product.id} className="border border-border rounded-md">
            <ItemMedia variant="image">
              <Image
                src={product.imageUrl || ''}
                alt={product.name || ''}
                width={40}
                height={40}
                className="object-cover rounded-md"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">{product.name}</ItemTitle>
              <ItemDescription>${product.price}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
              <Button variant="outline" size="sm" asChild>
                <Link target="_blank" to={product.link || ''}>
                  Open link
                </Link>
              </Button>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  )
}
