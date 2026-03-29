'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
    const token = formData.get('token')

    const cookieStore = await cookies()
    cookieStore.set('auth-token', JSON.stringify(token), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })
}

export async function signOut() {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    redirect('/login')
}
