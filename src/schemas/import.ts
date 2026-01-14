import { z } from 'zod'

export const importSchema = z.object({
  url: z.string().url(),
})

export type ImportSchema = z.infer<typeof importSchema>

export const bulkImportSchema = z.object({
  url: z.string().url(),
  search: z.string(),
})

export type BulkImportSchema = z.infer<typeof bulkImportSchema>

export const extractSchema = z.object({
  products: z.array(
    z.object({
      title: z.string(),
      price: z.number(),
      description: z.string(),
      url: z.string().url(),
    }),
  ),
})

export type ExtractSchema = z.infer<typeof extractSchema>

export const importJsonSchema = z.object({
  url: z.string().url(),
  json: z.string(),
})

export type ImportJsonSchema = z.infer<typeof importJsonSchema>

export const scrapeUrlSchema = z.object({
  title: z.string(),
  details: z.string(),
  image: z.string().url(),
})

export type ScrapeUrlSchema = z.infer<typeof scrapeUrlSchema>
