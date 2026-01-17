import { prisma } from '@/db'
import { openrouter } from '@/lib/open-router'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ summary: 'Summary' }), {
          status: 200,
        })
      },
      POST: async ({ request, context }) => {
        const { itemId, prompt } = await request.json()

        if (!itemId || !prompt) {
          return new Response(
            JSON.stringify({ error: 'Missing prompt or itemId' }),
            {
              status: 400,
            },
          )
        }

        const item = await prisma.savedItem.findUnique({
          where: {
            id: itemId,
            userId: context?.user.id,
          },
        })

        if (!item) {
          return new Response(JSON.stringify({ error: 'Item not found' }), {
            status: 404,
          })
        }

        // Stream summary
        const result = await streamText({
          model: openrouter.chat('xiaomi/mimo-v2-flash:free'),
          system: `You are a helpful assistant that creates concise, informative summaries of web content.
          Your summaries should:
          - Be 2-3 paragraphs long
          - Capture the main points and key takeaways
          - Be written in a clear, professional tone`,
          prompt: `Please summarize the following content:\n\n${prompt}`,
        })

        // Return the stream in the format useCompletion expects
        return result.toTextStreamResponse()
      },
    },
  },
})
