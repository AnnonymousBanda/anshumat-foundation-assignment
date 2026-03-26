'use client'

import { useState } from 'react'
import { verifyOtpAndSignIn } from '@/app/actions/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function LoginPage() {
    const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST')
    const [useEmail, setUseEmail] = useState(false)
    const [identifier, setIdentifier] = useState('')
    const [otp, setOtp] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('Hidden error to prevent layout shift')

    const handleSendOTP = async () => {
        if (!identifier.trim()) {
            setError('Please enter your details')
            return
        }

        setError('Hidden error to prevent layout shift')
        setIsLoading(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setStep('VERIFY')
        } catch (err) {
            setError('Failed to send OTP. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        if (otp.length < 4) {
            setError('Please enter a valid OTP')
            return
        }

        setError('Hidden error to prevent layout shift')
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('username', identifier)
            formData.append('otp', otp)
            await verifyOtpAndSignIn(formData)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Verification failed. Please try again.',
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-sm p-8 animate-fade-in">
                {step === 'REQUEST' && (
                    <>
                        <h2 className="mb-1">Welcome Back</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            Sign in to continue your passport application
                        </p>

                        <label className="block mb-2">
                            {useEmail ? 'Email Address' : 'Mobile Number'}
                        </label>
                        <Input
                            type={useEmail ? 'email' : 'tel'}
                            placeholder={
                                useEmail ? 'you@example.com' : '+91 98765 43210'
                            }
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mb-4 h-12 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                            disabled={isLoading}
                        />

                        <p
                            className={`text-sm mb-4 ${error !== 'Hidden error to prevent layout shift' ? 'text-red-500' : 'text-transparent'}`}
                        >
                            {error}
                        </p>

                        <Button
                            className="w-full h-12 text-base"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>

                        <button
                            onClick={() => {
                                setUseEmail(!useEmail)
                                setIdentifier('')
                                setError('Hidden error to prevent layout shift')
                            }}
                            className="mt-4 block mx-auto text-sm text-primary hover:underline"
                            disabled={isLoading}
                        >
                            {useEmail
                                ? 'Use Mobile instead'
                                : 'Use Email instead'}
                        </button>
                    </>
                )}

                {step === 'VERIFY' && (
                    <div className="animate-fade-in">
                        <h2 className="mb-1">Verify it's you</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            We sent a code to
                            <span className="font-medium text-foreground">
                                {identifier}
                            </span>
                        </p>

                        <label className="block mb-2">Enter OTP</label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ''))
                            }
                            className="mb-4 h-12 text-base text-center tracking-widest focus:ring-2 focus:ring-primary focus:border-primary"
                            disabled={isLoading}
                        />

                        <p
                            className={`text-sm mb-4 ${error !== 'Hidden error to prevent layout shift' ? 'text-red-500' : 'text-transparent'}`}
                        >
                            {error}
                        </p>

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
                                setOtp('')
                                setError('Hidden error to prevent layout shift')
                            }}
                            className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
                            disabled={isLoading}
                        >
                            Change {useEmail ? 'Email' : 'Mobile Number'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
