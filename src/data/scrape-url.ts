import { authFnMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import {
  importSchema,
  ScrapeUrlSchema,
  scrapeUrlSchema,
} from '@/schemas/import'
import { prisma } from '@/db'
import { firecrawl } from '@/lib/firecrawl'

export const scrapeUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: scrapeUrlSchema,
          },
        ],
        onlyMainContent: true,
      })

      const jsonData = (await result.json) as ScrapeUrlSchema
      // let publishedAt = null
      // if (jsonData.products.length > 0) {
      //   const parsed = new Date(jsonData.products[0].publishedAt)
      //   if (!isNaN(parsed.getTime())) {
      //     publishedAt = parsed
      //   }
      // }

      const item = await prisma.productDetail.create({
        data: {
          title: jsonData.title,
          details: jsonData.details,
          image: jsonData.image,
          url: data.url,
          userId: context.user.id,
        },
      })
      return { item }
    } catch (error) {
      console.error(error)
      return {
        error: 'Failed to scrape url',
      }
    }
  })
