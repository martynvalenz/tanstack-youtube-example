// src/start.ts
import { createStart } from '@tanstack/react-start'
import { createMiddleware } from '@tanstack/react-start'
import { authMiddleware } from './middlewares/auth.middleware'

const loggingMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    const url = new URL(request.url)

    console.log(`Request to ${url.pathname}`)
    console.log(`Request method ${request.method}`)
    return next()
  },
)

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [loggingMiddleware, authMiddleware],
  }
})
