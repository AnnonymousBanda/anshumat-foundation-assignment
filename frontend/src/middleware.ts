import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let token = request.cookies.get('auth-token')?.value

    if (token) {
        token = token.replace(/"/g, '')
    }

    let isValid = false

    if (token) {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            isValid = res.status === 200
            console.log(`Token: ${token} | Valid: ${isValid}`)
        } catch {
            isValid = false
        }
    }

    const protectedPaths = [
        '/dashboard',
        '/profile',
        '/form',
        '/logout',
        '/confirmation',
        '/onboarding',
        '/upload',
    ]

    const authPaths = ['/login', '/register']

    const isTryingToAccessProtected = protectedPaths.includes(
        request.nextUrl.pathname,
    )
    const isTryingToAccessLogin = authPaths.includes(request.nextUrl.pathname)

    if (!isValid && isTryingToAccessProtected) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isValid && isTryingToAccessLogin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
