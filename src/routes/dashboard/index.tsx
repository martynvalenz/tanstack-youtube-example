import { createFileRoute } from '@tanstack/react-router'
import { getSessionFn } from '@/data/session'

export const Route = createFileRoute('/dashboard/')({
  loader: async () => getSessionFn(),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  return <div>{user.name}</div>
}
