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
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
})

export type ExtractSchema = z.infer<typeof extractSchema>
