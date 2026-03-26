'use client'

import PageShell from '@/components/layout/PageShell'
import SurfaceCard from '@/components/common/SurfaceCard'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Link from 'next/link'
import { Info } from 'lucide-react'

const steps = [
    'Personal Info',
    'Family Details',
    'Address',
    'Documents',
    'Review',
]

export default function ApplicationFormPage() {
    return (
        <PageShell
            navbarState="form"
            formStep={{ current: 2, total: 5, label: 'Family Details' }}
            savedAt="2:31 PM"
            contentClassName="max-w-2xl animate-fade-in"
        >
            <SurfaceCard className="p-8">
                <div className="flex items-center justify-between mb-10">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center flex-1"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                                    i < 1
                                        ? 'bg-success text-success-foreground'
                                        : i === 1
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-secondary text-muted-foreground'
                                }`}
                            >
                                {i + 1}
                            </div>
                            <span
                                className={`text-xs font-medium text-center ${i === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block mb-2">Mother's Name</label>
                        <Input
                            placeholder="As per Aadhaar"
                            className="h-12 text-base"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Father's Name</label>
                        <Input
                            placeholder="As per Aadhaar"
                            className="h-12 text-base"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <label>Spouse's Name</label>
                            <span title="Leave blank if unmarried. Name must match marriage certificate.">
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </span>
                        </div>
                        <Input
                            placeholder="Leave blank if not applicable"
                            className="h-12 text-base"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                    <Button variant="outline" size="lg">
                        Back
                    </Button>
                    <Link href="/upload">
                        <Button size="lg">Save & Continue</Button>
                    </Link>
                </div>
            </SurfaceCard>
        </PageShell>
    )
}
