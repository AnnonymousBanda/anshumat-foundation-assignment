import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    context: { params: Promise<{ application_id: string }> },
) {
    const { application_id } = await context.params
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
            `${process.env.NEXT_PUBLIC_API_URL}/form/details/${application_id}`,
            {
                method: 'GET',
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
            { detail: 'Failed to fetch form details. Please try again.' },
            { status: 500 },
        )
    }
}
