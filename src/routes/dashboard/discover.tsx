import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  type BulkScrapeProgress,
  bulkScrapeUrlsFn,
  searchWebFn,
} from '@/data/items'
import { searchSchema } from '@/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/discover')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [bulkIsPending, startBulkTransition] = useTransition()
  const [searchResults, setSearchResults] = useState<Array<SearchResultWeb>>([])
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const form = useForm({
    defaultValues: {
      query: '',
    },
    validators: {
      onSubmit: searchSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await searchWebFn({ data: { query: value.query } })
        setSearchResults(result)
      })
    },
  })

  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())

  const handleSelectAll = () => {
    if (selectedUrls.size === searchResults.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(searchResults.map((link) => link.url)))
    }
  }

  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedUrls(newSelected)
  }

  const handleBulkImport = () => {
    if (selectedUrls.size === 0) {
      toast.error('Please select at least one url')
      return
    }

    startBulkTransition(async () => {
      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: '',
        status: 'success',
      })
      let successCount = 0
      let failedCount = 0
      // await bulkScrapeUrlsFn({ data: { urls: Array.from(selectedUrls) } })
      for await (const update of await bulkScrapeUrlsFn({
        data: { urls: Array.from(selectedUrls) },
      })) {
        setProgress(update)
        if (update.status === 'success') {
          successCount++
        } else {
          failedCount++
        }
      }
      setProgress(null)
      if (failedCount > 0) {
        toast.error(`Imported ${successCount} Urls ${failedCount} failed`)
      } else {
        toast.success(`Imported ${successCount} Urls successfully`)
      }
    })
  }

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-xl space-y-6 px-4">
        <div className="text-center ">
          <h1 className="text-3xl font-bold">Discover new content</h1>
          <p className="text-muted-foreground pt-1">
            Find interesting and relevant content to save and summarize
          </p>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Topic search
              </CardTitle>
              <CardDescription>
                Search the web for content and import what's interesting to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <FieldGroup>
                  <form.Field name="query">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Search</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="e.g. React server componens tutorial"
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Spinner /> : <Search />}
                    {isPending ? 'Searching...' : 'Search the web'}
                  </Button>
                </FieldGroup>
              </form>
              {/* Discovered URLs list */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Found {searchResults.length} URLs
                    </p>

                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      size="sm"
                    >
                      {selectedUrls.size === searchResults.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </div>

                  <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
                    {searchResults.map((link) => (
                      <label
                        key={link.url}
                        className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
                        htmlFor={link.url}
                      >
                        <Checkbox
                          checked={selectedUrls.has(link.url)}
                          onCheckedChange={() => handleToggleUrl(link.url)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {link.title ?? 'Title has not been found'}
                          </p>

                          <p className="text-muted-foreground truncate text-xs">
                            {link.description ??
                              'Description has not been found'}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {link.url}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Importing: {progress.completed} / {progress.total}
                        </span>
                        <span className="font-medium">
                          {Math.round(progress.completed / progress.total) *
                            100}
                        </span>
                      </div>
                      <Progress
                        value={(progress.completed / progress.total) * 100}
                      />
                    </div>
                  )}

                  <Button
                    disabled={bulkIsPending}
                    onClick={handleBulkImport}
                    className="w-full"
                    type="button"
                  >
                    {bulkIsPending ? (
                      <>
                        <Spinner />
                        {progress
                          ? `Importing ${progress.completed}/${progress.total}...`
                          : 'Starting...'}
                      </>
                    ) : (
                      `Import ${selectedUrls.size} URLs`
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
