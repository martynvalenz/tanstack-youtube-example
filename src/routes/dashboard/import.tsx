import { Button } from '@/components/ui/button'
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
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { scrapeUrlFn } from '@/data/items'
import {
  bulkImportSchema,
  importSchema,
  type BulkImportSchema,
} from '@/schemas/import'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, Link } from 'lucide-react'
import { useTransition } from 'react'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await scrapeUrlFn({ data: value })
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    } as BulkImportSchema,
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startBulkTransition(async () => {})
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
        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <Link className="size-4" />
              Single page
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Globe className="size-4" />
              Batch import
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single">
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
                    <form.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              type="url"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Spinner />
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Import Url'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="batch">
            <Card>
              <CardHeader>
                <CardTitle>Batch import</CardTitle>
                <CardDescription>
                  Import multiple web pages to your library 📚
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="https://example.com"
                              type="url"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <bulkForm.Field
                      name="search"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Search</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Search"
                              type="search"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <Button type="submit" disabled={isBulkPending}>
                      {isBulkPending ? (
                        <>
                          <Spinner />
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Import Urls'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
