import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Logged out successfully')
        },
        onError: ({ error }) => {
          toast.error('Failed to log out', {
            description: error.message,
          })
        },
      },
    })
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/img/tanstack.png" alt="TanStack" className="size-9" />
          <h1 className="text-lg font-semibold">Tanstack Start</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? null : session ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className={buttonVariants({ variant: 'outline' })}
              >
                Dashboard
              </Link>
              <Button variant="destructive" onClick={handleSignOut}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={buttonVariants({ variant: 'outline' })}
              >
                Log in
              </Link>
              <Link to="/sign-up" className={buttonVariants()}>
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
