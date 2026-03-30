import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookieStore = await cookies()
    const tokenValue = cookieStore.get('auth-token')?.value

    if (!tokenValue) {
        return NextResponse.json(
            { detail: 'Your session has expired. Please log in again.' },
            { status: 401 },
        )
    }

    const token = tokenValue.replace(/"/g, '')

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/form/new-form`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json(
            { detail: 'Failed to create form. Please try again.' },
            { status: 500 },
        )
    }
}
