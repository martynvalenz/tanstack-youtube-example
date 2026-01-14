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
import { chromium } from 'playwright'
import fetch from 'node-fetch'

const BASE =
  'https://www.albertsons.com/abs/pub/xapi/pgmsearch/v1/search/products'

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
      // let publishedAt = null
      // if (jsonData.products.length > 0) {
      //   const parsed = new Date(jsonData.products[0].publishedAt)
      //   if (!isNaN(parsed.getTime())) {
      //     publishedAt = parsed
      //   }
      // }

      const updatedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          products: jsonData.products,
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

        // let publishedAt = null
        // if (jsonData.products.length > 0) {
        //   const parsed = new Date(jsonData.products[0].publishedAt)
        //   if (!isNaN(parsed.getTime())) {
        //     publishedAt = parsed
        //   }
        // }

        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            products: jsonData.products,
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

async function searchProducts({ q, storeid = '177', rows = 30, start = 0 }) {
  const url = new URL(BASE)
  url.searchParams.set('q', q)
  url.searchParams.set('storeid', storeid)
  url.searchParams.set('rows', String(rows))
  url.searchParams.set('start', String(start))
  url.searchParams.set('search-type', 'keyword')
  url.searchParams.set('includeOffer', 'true')
  url.searchParams.set('banner', 'al')
  url.searchParams.set('channel', 'instore')

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      // These two help because some APIs enforce same-site expectations:
      referer: 'https://www.albertsons.com/',
      origin: 'https://www.albertsons.com',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()

  const products = data?.primaryProducts ?? []
  return products
}

function extractProductUrl(p: any) {
  // We don’t know the exact field names in your JSON, so check common ones.
  const candidates = [
    p.productUrl,
    p.productURL,
    p.pdpUrl,
    p.pdpURL,
    p.seoUrl,
    p.seoURL,
    p.url,
    p.link,
  ].filter(Boolean)

  // Sometimes the URL is relative like "/shop/product-details.1234.html"
  if (candidates[0]) {
    return candidates[0].startsWith('http')
      ? candidates[0]
      : `https://www.albertsons.com${candidates[0]}`
  }

  return null
}

export const getItemsFromUrlFn = createServerFn({
  method: 'GET',
})
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    // const browser = await chromium.launch({ headless: true })
    // const page = await browser.newPage()

    // page.setDefaultNavigationTimeout(60000)

    // await page.goto(
    //   'https://www.albertsons.com/shop/search-results.html?q=wine&tab=products',
    //   { waitUntil: 'domcontentloaded' },
    // )

    // // Allow client-side rendering
    // await page.waitForTimeout(5000)

    // // Collect links
    // const links = await page.$$eval('a', (as) => [
    //   ...new Set(as.map((a) => a.href)),
    // ])

    // const productLinks = links.filter((href) =>
    //   href.includes('/shop/product-details'),
    // )

    // console.log(productLinks)
    // console.log(`Found ${productLinks.length} product links`)

    // await browser.close()

    // return productLinks
    const products = await searchProducts({ q: 'wine', start: 0, rows: 30 })

    const links = products.map(extractProductUrl).filter(Boolean)

    console.log('Found links:', links.length)
    console.log(links.slice(0, 10))

    return links
  })
