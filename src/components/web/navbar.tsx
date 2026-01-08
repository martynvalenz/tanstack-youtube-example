import { Button } from '../ui/button'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/img/tanstack.png" alt="TanStack" className="size-9" />
          <h1 className="text-lg font-semibold">Tanstack Start</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Log in</Button>
          <Button>Get started</Button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
