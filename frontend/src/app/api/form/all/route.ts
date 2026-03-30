import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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
            `${process.env.NEXT_PUBLIC_API_URL}/form/all`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        )

        const raw = await response.text()
        let data: unknown = {}

        if (raw) {
            try {
                data = JSON.parse(raw)
            } catch {
                data = { detail: raw }
            }
        }

        return NextResponse.json(data, { status: response.status })
    } catch {
        return NextResponse.json(
            { detail: 'Failed to retrieve applications.' },
            { status: 500 },
        )
    }
}
