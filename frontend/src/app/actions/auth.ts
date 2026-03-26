'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyOtpAndSignIn(formData: FormData) {
    const username = formData.get('username')
    const otp = formData.get('otp')

    if (otp !== '123456') {
        throw new Error('Invalid OTP')
    }

    const userData = { name: username, verifiedAt: new Date().toISOString() }
    const cookieStore = await cookies()
    cookieStore.set('auth-token', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    redirect('/dashboard')
}

export async function signIn(formData: FormData) {
    const username = formData.get('username')

    const userData = {
        name: username,
        role: 'Admin',
        loginTime: new Date().toISOString(),
    }

    const cookieStore = await cookies()
    cookieStore.set('auth-token', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    redirect('/dashboard')
}

export async function signOut() {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    redirect('/login')
}
