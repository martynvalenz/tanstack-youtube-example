import { firecrawl } from '@/lib/firecrawl'
import { createServerFn } from '@tanstack/react-start'
import {
  bulkImportSchema,
  type ExtractSchema,
  extractSchema,
  importSchema,
} from '@/schemas/import'
import { prisma } from '@/db'
import { ItemStatus } from '@/generated/prisma/enums'
import { authFnMiddleware } from '@/middlewares/auth.middleware'
import z from 'zod'

export type BulkScrapeProgress = {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed'
}

export const scrapeUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.user.id,
        status: ItemStatus.PROCESSING,
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: extractSchema,
          },
        ],
        onlyMainContent: true,
      })

      const jsonData = (await result.json) as ExtractSchema
      let publishedAt = null
      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }

      const updatedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.author || null,
          publishedAt,
          status: ItemStatus.COMPLETED,
        },
      })
      return updatedItem
    } catch (error) {
      const failedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: ItemStatus.FAILED,
        },
      })
      return failedItem
    }
  })

export const mapUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
    })

    return result.links
  })

export const bulkScrapeUrlsFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()),
    }),
  )
  .handler(async ({ data, context }) => {
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]

      const item = await prisma.savedItem.create({
        data: {
          url,
          userId: context.user.id,
          status: ItemStatus.PENDING,
        },
      })
      try {
        const result = await firecrawl.scrape(url, {
          formats: [
            'markdown',
            {
              type: 'json',
              schema: extractSchema,
            },
          ],
          onlyMainContent: true,
        })

        const jsonData = (await result.json) as ExtractSchema

        let publishedAt = null
        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }

        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.author || null,
            publishedAt,
            status: ItemStatus.COMPLETED,
          },
        })
      } catch (error) {
        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            status: ItemStatus.FAILED,
          },
        })
      }
    }
  })

export const getItemsFn = createServerFn({
  method: 'GET',
})
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: {
        userId: context.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return items
  })
