'use client'

import { useRef, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import SurfaceCard from '@/components/common/SurfaceCard'
import Button from '@/components/common/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, CheckCircle2 } from 'lucide-react'
import { notify } from '@/lib/utils'

export default function DocumentUploadPage() {
    const router = useRouter()
    const aadhaarInputRef = useRef<HTMLInputElement | null>(null)
    const addressProofInputRef = useRef<HTMLInputElement | null>(null)
    const supportingDocInputRef = useRef<HTMLInputElement | null>(null)
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
    const [addressProofFile, setAddressProofFile] = useState<File | null>(null)
    const [supportingDocFile, setSupportingDocFile] = useState<File | null>(
        null,
    )

    const formatSize = (size: number) => {
        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`
        }
        return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }

    const validateFile = (file: File) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
        ]
        const maxSizeBytes = 5 * 1024 * 1024

        if (!allowedTypes.includes(file.type)) {
            notify.error('Only PDF, JPG, and PNG files are allowed.')
            return false
        }

        if (file.size > maxSizeBytes) {
            notify.error('File size must be 5MB or smaller.')
            return false
        }

        return true
    }

    const handleFileChange = (
        file: File | null,
        setter: (file: File | null) => void,
    ) => {
        if (!file) {
            return
        }
        if (!validateFile(file)) {
            return
        }
        setter(file)
    }

    const handleContinue = () => {
        if (!aadhaarFile) {
            notify.info('Please upload Aadhaar Card before continuing.')
            return
        }
        if (!addressProofFile) {
            notify.info('Please upload Address Proof before continuing.')
            return
        }
        router.push('/confirmation')
    }

    return (
        <PageShell
            navbarState="upload"
            contentClassName="max-w-2xl animate-fade-in"
        >
            <SurfaceCard className="p-8">
                <h2 className="mb-1">Upload Documents</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    Accepted formats: PDF, JPG, PNG (max 5MB each)
                </p>

                <h2 className="text-base font-semibold mb-4">
                    Required Documents
                </h2>
                <div className="space-y-4 mb-8">
                    {aadhaarFile ? (
                        <div className="border border-success/30 bg-success/5 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                    Aadhaar Card
                                </div>
                                <div
                                    className="text-xs text-muted-foreground truncate"
                                    title={aadhaarFile.name}
                                >
                                    {aadhaarFile.name} —{' '}
                                    {formatSize(aadhaarFile.size)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() =>
                                        aadhaarInputRef.current?.click()
                                    }
                                >
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground hover:underline"
                                    onClick={() => setAadhaarFile(null)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                            onClick={() => aadhaarInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                handleFileChange(
                                    e.dataTransfer.files?.[0] ?? null,
                                    setAadhaarFile,
                                )
                            }}
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                            <div className="font-medium text-sm mb-1">
                                Aadhaar Card
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Drag & drop or click to browse
                            </div>
                        </div>
                    )}
                    <input
                        ref={aadhaarInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                            handleFileChange(
                                e.target.files?.[0] ?? null,
                                setAadhaarFile,
                            )
                        }
                    />

                    {addressProofFile ? (
                        <div className="border border-success/30 bg-success/5 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                    Address Proof
                                </div>
                                <div
                                    className="text-xs text-muted-foreground truncate"
                                    title={addressProofFile.name}
                                >
                                    {addressProofFile.name} —{' '}
                                    {formatSize(addressProofFile.size)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() =>
                                        addressProofInputRef.current?.click()
                                    }
                                >
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground hover:underline"
                                    onClick={() => setAddressProofFile(null)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                            onClick={() =>
                                addressProofInputRef.current?.click()
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                handleFileChange(
                                    e.dataTransfer.files?.[0] ?? null,
                                    setAddressProofFile,
                                )
                            }}
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                            <div className="font-medium text-sm mb-1">
                                Address Proof
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Drag & drop or click to browse
                            </div>
                        </div>
                    )}
                    <input
                        ref={addressProofInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                            handleFileChange(
                                e.target.files?.[0] ?? null,
                                setAddressProofFile,
                            )
                        }
                    />
                </div>

                <h2 className="text-base font-semibold mb-4">
                    Optional Documents
                </h2>
                {supportingDocFile ? (
                    <div className="border border-success/30 bg-success/5 rounded-xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                                Supporting Document
                            </div>
                            <div
                                className="text-xs text-muted-foreground truncate"
                                title={supportingDocFile.name}
                            >
                                {supportingDocFile.name} —{' '}
                                {formatSize(supportingDocFile.size)}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                className="text-xs text-primary hover:underline"
                                onClick={() =>
                                    supportingDocInputRef.current?.click()
                                }
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                className="text-xs text-muted-foreground hover:underline"
                                onClick={() => setSupportingDocFile(null)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                        onClick={() => supportingDocInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault()
                            handleFileChange(
                                e.dataTransfer.files?.[0] ?? null,
                                setSupportingDocFile,
                            )
                        }}
                    >
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <div className="font-medium text-sm mb-1">
                            Supporting Document
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Drag & drop or click to browse
                        </div>
                    </div>
                )}
                <input
                    ref={supportingDocInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) =>
                        handleFileChange(
                            e.target.files?.[0] ?? null,
                            setSupportingDocFile,
                        )
                    }
                />

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                    <Link href="/form">
                        <Button variant="outline" size="lg">
                            Back
                        </Button>
                    </Link>
                    <Button size="lg" onClick={handleContinue}>
                        Save & Continue
                    </Button>
                </div>
            </SurfaceCard>
        </PageShell>
    )
}
