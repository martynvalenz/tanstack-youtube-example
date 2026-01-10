import { firecrawl } from '@/lib/firecrawl'
import { createServerFn } from '@tanstack/react-start'
import {
  type ExtractSchema,
  extractSchema,
  importSchema,
} from '@/schemas/import'
import { prisma } from '@/db'
import { ItemStatus } from '@/generated/prisma/enums'
import { authMiddleware } from '@/middlewares/auth.middleware'

export const scrapeUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authMiddleware])
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
      console.log(jsonData)
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
