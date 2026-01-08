import Navbar from '@/components/web/navbar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  ;<div>
    <Navbar />
  </div>
}
