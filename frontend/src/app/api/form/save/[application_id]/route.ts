import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: { application_id: string } },
) {
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
        const body = await request.json()

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/form/save/${params.application_id}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            },
        )

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json(
            { detail: 'Failed to save form progress. Please try again.' },
            { status: 500 },
        )
    }
}
