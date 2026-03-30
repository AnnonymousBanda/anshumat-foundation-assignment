'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { signIn } from '@/app/actions/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { notify } from '@/lib/utils'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type LoginMode = 'PHONE' | 'EMAIL'
type LoginStep = 'REQUEST' | 'VERIFY'

export default function LoginPage() {
    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])

    const [mode, setMode] = useState<LoginMode>('PHONE')
    const [step, setStep] = useState<LoginStep>('REQUEST')
    const [isLoading, setIsLoading] = useState(false)

    const [phoneNumber, setPhoneNumber] = useState('')
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const otp = otpDigits.join('')
    const router = useRouter()

    const handleModeSwitch = (nextMode: LoginMode) => {
        if (isLoading || step === 'VERIFY') {
            return
        }

        setMode(nextMode)
        setPhoneNumber('')
        setEmail('')
        setPassword('')
    }

    const handleSendOTP = async () => {
        if (phoneNumber.length !== 10) {
            notify.error('Please enter a valid 10-digit mobile number')
            return
        }

        setIsLoading(true)

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + '/auth/login/otp/send',
                { phone_number: phoneNumber },
            )

            if (res.status === 200) {
                notify.success(
                    'A one-time verification code has been sent to your mobile number.',
                )
            }
            else throw new Error(res.data.detail)

            const { hash, expires_at } = res.data
            sessionStorage.setItem('otp_hash', hash)
            sessionStorage.setItem('otp_expires_at', expires_at.toString())
            sessionStorage.setItem('otp_phone', phoneNumber)

            setStep('VERIFY')
        } catch {
            notify.error('Failed to send OTP. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailLogin = async () => {
        if (!email.trim() || !password.trim()) {
            notify.error('Please fill all required fields')
            return
        }

        setIsLoading(true)

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + '/auth/login/email',
                {
                    email,
                    password,
                },
            )

            if (res.status !== 200)
                throw new Error(
                    res.data.detail || 'Login failed. Please try again.',
                )

            const formData = new FormData()
            formData.append('token', res.data.token)
            await signIn(formData)
            notify.success(
                'Sign-in successful. Redirecting you to your dashboard.',
            )
            router.push('/dashboard')
        } catch (error) {
            const backendErrorMessage =
                (error as { response?: { data?: { detail?: string } } })
                    .response?.data?.detail || 'Login failed. Please try again.'
            notify.error(backendErrorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            notify.error('Please enter a valid OTP')
            return
        }

        setIsLoading(true)

        try {
            const expiresAtString = sessionStorage.getItem('otp_expires_at')

            const res = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + '/auth/login/otp/verify',
                {
                    phone_number: sessionStorage.getItem('otp_phone'),
                    hash_value: sessionStorage.getItem('otp_hash'),
                    expires_at: expiresAtString
                        ? parseInt(expiresAtString, 10)
                        : 0,
                    otp,
                },
            )

            const formData = new FormData()
            formData.append('token', res.data.token)
            await signIn(formData)

            sessionStorage.removeItem('otp_hash')
            sessionStorage.removeItem('otp_expires_at')
            sessionStorage.removeItem('otp_phone')

            notify.success(
                'Verification successful. Redirecting you to your dashboard.',
            )
            router.push('/dashboard')
        } catch (err) {
            const backendErrorMessage =
                (
                    err as {
                        response?: { data?: { detail?: string } }
                    }
                ).response?.data?.detail ||
                'Verification failed. Please try again.'

            notify.error(backendErrorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, '')
        if (!numericValue) {
            setOtpDigits((prev) => {
                const next = [...prev]
                next[index] = ''
                return next
            })
            return
        }

        const digit = numericValue[numericValue.length - 1]
        setOtpDigits((prev) => {
            const next = [...prev]
            next[index] = digit
            return next
        })

        if (index < 5) {
            otpInputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, key: string) => {
        if (key !== 'Backspace') {
            return
        }

        if (otpDigits[index]) {
            setOtpDigits((prev) => {
                const next = [...prev]
                next[index] = ''
                return next
            })
            return
        }

        if (index > 0) {
            otpInputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (pastedText: string) => {
        const digits = pastedText.replace(/\D/g, '').slice(0, 6)
        if (!digits) {
            return
        }

        setOtpDigits(() => {
            const next = Array(6).fill('')
            digits.split('').forEach((digit, index) => {
                next[index] = digit
            })
            return next
        })

        const focusIndex = Math.min(digits.length - 1, 5)
        otpInputRefs.current[focusIndex]?.focus()
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-sm p-8 animate-fade-in">
                <h2 className="mb-1">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Sign in with mobile OTP or email and password.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6 rounded-lg bg-muted p-1">
                    <button
                        onClick={() => handleModeSwitch('PHONE')}
                        disabled={isLoading || step === 'VERIFY'}
                        className={`rounded-md py-2 text-sm transition ${
                            mode === 'PHONE'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Phone + OTP
                    </button>

                    <button
                        onClick={() => handleModeSwitch('EMAIL')}
                        disabled={isLoading || step === 'VERIFY'}
                        className={`rounded-md py-2 text-sm transition ${
                            mode === 'EMAIL'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Email + Password
                    </button>
                </div>

                {step === 'REQUEST' && (
                    <>
                        {mode === 'PHONE' && (
                            <>
                                <label className="block mb-2">
                                    Mobile Number
                                </label>
                                <div className="mb-4 flex h-12 items-center overflow-hidden rounded-md border border-input bg-background">
                                    <span className="flex h-full items-center border-r border-input px-3 text-sm text-muted-foreground">
                                        +91
                                    </span>
                                    <Input
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(
                                                e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 10),
                                            )
                                        }
                                        className="h-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button
                                    className="w-full h-12 text-base"
                                    onClick={handleSendOTP}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>
                            </>
                        )}

                        {mode === 'EMAIL' && (
                            <>
                                <label className="block mb-2">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mb-4 h-12 text-base"
                                    disabled={isLoading}
                                />

                                <label className="block mb-2">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="mb-4 h-12 text-base"
                                    disabled={isLoading}
                                />

                                <Button
                                    className="w-full h-12 text-base"
                                    onClick={handleEmailLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </>
                        )}
                    </>
                )}

                {step === 'VERIFY' && (
                    <div className="animate-fade-in">
                        <h2 className="mb-1">Verify it's you</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            We sent a code to
                            <span className="pl-2 font-medium text-foreground">
                                +91 {phoneNumber}
                            </span>
                        </p>

                        <label className="block mb-2">Enter OTP</label>
                        <div className="mb-4 grid grid-cols-6 gap-2">
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        otpInputRefs.current[index] = element
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleOtpChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        handleOtpKeyDown(index, e.key)
                                    }
                                    onPaste={(e) => {
                                        e.preventDefault()
                                        handleOtpPaste(
                                            e.clipboardData.getData('text'),
                                        )
                                    }}
                                    className="h-12 w-full rounded-md border border-input bg-background text-center text-base outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        <Button
                            className="w-full h-12 text-base mb-4"
                            onClick={handleVerifyOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                        </Button>

                        <button
                            onClick={() => {
                                setStep('REQUEST')
                                setOtpDigits(Array(6).fill(''))
                            }}
                            className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
                            disabled={isLoading}
                        >
                            Change Mobile Number
                        </button>
                    </div>
                )}

                <p className="text-sm text-muted-foreground text-center mt-6">
                    New user?{' '}
                    <Link
                        href="/register"
                        className="text-primary hover:underline"
                    >
                        Go to Register Page
                    </Link>
                </p>
            </div>
        </div>
    )
}
