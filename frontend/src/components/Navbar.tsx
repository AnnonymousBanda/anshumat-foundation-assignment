import Link from 'next/link'
import { User } from 'lucide-react'
import Button from '@/components/common/Button'
import { signOut } from '@/app/actions/auth'

type NavbarState = 'public' | 'dashboard' | 'form'
type NavbarStateExtended = NavbarState | 'upload'

interface NavbarProps {
    state?: NavbarStateExtended
    formStep?: { current: number; total: number; label: string }
    savedAt?: string
}

const Navbar = ({ state = 'public', formStep, savedAt }: NavbarProps) => {
    const profileMenu = (
        <details className="relative">
            <summary className="list-none cursor-pointer w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <User className="w-4 h-4 text-primary" />
            </summary>
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-border bg-card shadow-md p-1 z-50">
                <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-sm rounded-sm hover:bg-secondary transition-colors"
                >
                    Profile
                </Link>
                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-secondary transition-colors"
                    >
                        Logout
                    </button>
                </form>
            </div>
        </details>
    )

    return (
        <nav className="h-16 border-b border-border bg-card px-6 sticky top-0 z-50">
            <div className="relative h-full flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold text-primary tracking-tight z-10"
                >
                    Passport Seva
                </Link>

                <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    {state === 'public' && (
                        <>
                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                How it works
                            </Link>
                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Docs
                            </Link>
                        </>
                    )}
                    {state === 'dashboard' && (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                                Dashboard
                            </Link>
                        </>
                    )}
                    {state === 'form' && formStep && (
                        <span className="text-sm font-medium text-muted-foreground">
                            Step {formStep.current} of {formStep.total} —{' '}
                            {formStep.label}
                        </span>
                    )}
                    {state === 'upload' && (
                        <span className="text-sm font-medium text-muted-foreground">
                            Document for verification
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 z-10">
                    {state === 'public' && (
                        <Link href="/login">
                            <Button size="sm">Login / Signup</Button>
                        </Link>
                    )}
                    {state === 'dashboard' && (
                        <>
                            <Link href="/onboarding">
                                <Button size="sm">New Application</Button>
                            </Link>
                            {profileMenu}
                        </>
                    )}
                    {state === 'upload' && profileMenu}
                    {state === 'form' && savedAt && (
                        <span className="text-xs font-medium bg-amber/15 text-amber px-3 py-1.5 rounded-full">
                            Draft Saved at {savedAt}
                        </span>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
