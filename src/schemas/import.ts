import { z } from 'zod'

export const importSchema = z.object({
  url: z.string().url(),
})

export type ImportSchema = z.infer<typeof importSchema>

export const bulkImportSchema = z.object({
  url: z.string().url(),
  search: z.string(),
})
