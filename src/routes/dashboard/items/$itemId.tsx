import { MessageResponse } from '@/components/ai-elements/message'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { getItemByIdFn, saveSummaryAndGenerateTagsFn } from '@/data/items'
import { cn } from '@/lib/utils'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Sparkles,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  loader: ({ params }) => getItemByIdFn({ data: { id: params.itemId } }),
  head: ({ loaderData }) => {
    return {
      meta: [
        {
          title: loaderData?.title || 'No title',
        },
        {
          property: 'og:title',
          content: loaderData?.title || 'No title',
        },
        {
          name: 'description',
          content: loaderData?.summary || 'No description',
        },
        {
          property: 'og:description',
          content: loaderData?.summary || 'No description',
        },
        {
          property: 'og:image',
          content: loaderData?.ogImage || 'No image',
        },
        {
          property: 'og:url',
          content: loaderData?.url || 'No url',
        },
        {
          name: 'twitter:title',
          content: loaderData?.title || 'No title',
        },
        {
          name: 'twitter:description',
          content: loaderData?.summary || 'No description',
        },
        {
          name: 'twitter:image',
          content: loaderData?.ogImage || 'No image',
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [contentOpen, setContentOpen] = useState(false)
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/summary',
    initialCompletion: data.summary ? data.summary : undefined,
    streamProtocol: 'text',
    body: { itemId: data.id },
    onFinish: async (_prompt, completionText) => {
      await saveSummaryAndGenerateTagsFn({
        data: { id: data.id, summary: completionText },
      })
      toast.success('Summary generated and saved')
      router.invalidate()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  function handleGenerateSummary() {
    if (!data.content) {
      toast.error('No content available to summarize')
      return
    }
    complete(data.content)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 w-full">
      <div className="flex justify-start">
        <Link
          to="/dashboard/items"
          className={buttonVariants({ variant: 'secondary' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Link>
      </div>
      {data.ogImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={data.ogImage}
            alt={data.title || 'No title'}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      )}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{data.title || 'No title'}</h1>
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {data.author && (
            <span className="inline-flex items-center gap-2">
              <User className="size-3.5" />
              {data.author}
            </span>
          )}
          {data.publishedAt && (
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-3.5" />
              {new Date(data.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Clock className="size-3.5" />
            Saved on{' '}
            {new Date(data.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>

          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            View on website
            <ExternalLink className="size-3.5" />
          </a>
        </div>
        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
        {/* Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                  Summary
                </h2>
                {completion || data.summary ? (
                  <MessageResponse>{completion}</MessageResponse>
                ) : (
                  <p className="text-muted-foreground italic">
                    {data.content
                      ? 'No summary yet. Generate on with ai'
                      : 'No content available to summarize'}
                  </p>
                )}
              </div>
              {data.content && !data.summary && (
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4" />
                      <span>Generate summary</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Content */}
        {data.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="secondary" className="w-full justify-between">
                <span className="font-medium">Full content</span>
                <ChevronDown
                  className={cn(
                    contentOpen ? 'rotate-180' : '',
                    'transition-transform duration-300 ease-in-out size-4',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <MessageResponse>{data.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
