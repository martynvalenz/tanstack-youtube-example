import { importSchema } from '@/schemas/import'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { scrapeUrlFn } from '@/data/scrape-url'
import { Image } from '@unpic/react'

export const Route = createFileRoute('/dashboard/scrape-link')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [scrapedData, setScrapedData] = useState<{
    id: string
    title: string
    details: string
    image: string
    url: string
  }>({
    id: '',
    title: '',
    details: '',
    image: '',
    url: '',
  })
  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const data = await scrapeUrlFn({ data: value })
        if (data?.error) {
          toast.error(data?.error)
          return
        }
        setScrapedData({
          id: data.item.id,
          title: data.item.title,
          details: data.item.details || '',
          image: data.item.image || '',
          url: data.item.url || '',
        })
        toast.success('JSON imported successfully')
        form.reset()
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import content</h1>
          <p className="text-muted-foreground pt-1">
            Save web pages to your library for later reading
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Single page</CardTitle>
            <CardDescription>
              Scrape and save a single web page to your library 📚
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field name="url">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Spinner />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Scrape url'
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
          {scrapedData.id && (
            <CardContent>
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold">Scraped data</h2>
                <p className="text-muted-foreground">
                  <Image
                    src={scrapedData.image}
                    alt={scrapedData.title}
                    width={200}
                    height={200}
                  />
                </p>
                <p className="text-muted-foreground">{scrapedData.title}</p>
                <p className="text-muted-foreground">{scrapedData.url}</p>
                <p className="text-muted-foreground">{scrapedData.details}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
