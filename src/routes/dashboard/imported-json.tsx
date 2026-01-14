import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { exportToExcel } from '@/data/export-xlsx'
import { deleteImportedJsonFn, getImportedJsonFn } from '@/data/improt-json'
import { copyToClipboard } from '@/lib/clipboard'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { Copy, SquareArrowOutUpRight } from 'lucide-react'

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
  const router = useRouter()
  const { products } = Route.useLoaderData()

  const onDelete = async () => {
    await deleteImportedJsonFn()

    router.navigate({ to: '/dashboard/import-json' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imported JSON</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="excel"
            size="sm"
            onClick={() => exportToExcel(products, 'products.xlsx')}
          >
            Export xlsx
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete data
          </Button>
        </div>
      </div>
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
              <Button variant="outline" size="icon-sm" asChild>
                <Link target="_blank" to={product.link || ''}>
                  <SquareArrowOutUpRight />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => copyToClipboard(product.link || '')}
              >
                <Copy />
              </Button>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  )
}
