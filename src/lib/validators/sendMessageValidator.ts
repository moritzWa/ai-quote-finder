import { z } from 'zod'

export const SendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
  quoteMode: z.boolean(),
})
